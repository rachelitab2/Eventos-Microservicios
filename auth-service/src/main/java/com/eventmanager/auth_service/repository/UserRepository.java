package com.eventmanager.auth_service.repository;

import com.eventmanager.auth_service.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsernameAndActiveTrue(String username);

    Optional<User> findByEmailAndActiveTrue(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
