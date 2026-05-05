package com.oldercare.repository;

import com.oldercare.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByBraceletCode(String braceletCode);
    Optional<User> findByDeviceToken(String deviceToken);
    boolean existsByBraceletCode(String braceletCode);
    boolean existsByEmailIgnoreCase(String email);
}
