package com.anyschool.repository;

import com.anyschool.model.Message;
import com.anyschool.model.School;
import com.anyschool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MessageRepository
 * 
 * Data access for direct messages between parents and schools
 * Phase 7D: Communication System
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find all messages in a thread
     */
    @Query("SELECT m FROM Message m WHERE m.threadId = :threadId OR m.id = :threadId ORDER BY m.sentAt ASC")
    List<Message> findByThreadIdOrderBySentAtAsc(@Param("threadId") Long threadId);

    /**
     * Find all threads for a parent (get first message of each thread)
     */
    List<Message> findByParentAndIsThreadStartTrueOrderBySentAtDesc(User parent);

    /**
     * Find all threads for a school (get first message of each thread)
     */
    List<Message> findBySchoolAndIsThreadStartTrueOrderBySentAtDesc(School school);

    /**
     * Find unread messages for a user
     */
    @Query("SELECT m FROM Message m WHERE m.sender != :user " +
           "AND ((m.parent = :user) OR (m.school.id IN :schoolIds)) " +
           "AND m.isRead = false " +
           "ORDER BY m.sentAt DESC")
    List<Message> findUnreadMessagesForUser(@Param("user") User user, @Param("schoolIds") List<Long> schoolIds);

    /**
     * Count unread messages for a parent
     */
    Long countByParentAndIsReadFalseAndSenderNot(User parent, User sender);

    /**
     * Count unread messages for a school
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.school = :school " +
           "AND m.isRead = false " +
           "AND m.sender != :currentUser")
    Long countUnreadForSchool(@Param("school") School school, @Param("currentUser") User currentUser);

    /**
     * Find conversation between parent and school
     */
    @Query("SELECT m FROM Message m WHERE m.school = :school AND m.parent = :parent " +
           "ORDER BY m.sentAt DESC")
    List<Message> findConversation(@Param("school") School school, @Param("parent") User parent);
}
