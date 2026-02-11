package com.example.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
    }
}