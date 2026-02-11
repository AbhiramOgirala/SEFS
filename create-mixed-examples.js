/**
 * Create Mixed File Type Examples
 * Demonstrates clustering across different file types
 */

const fs = require('fs').promises;
const path = require('path');

const mixedFiles = [
  // Machine Learning - Python files
  {
    name: 'neural_network.py',
    content: `import tensorflow as tf
import numpy as np

# Neural network implementation
class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = []
        self.biases = []
        
    def train(self, X, y, epochs=100):
        # Training loop with backpropagation
        for epoch in range(epochs):
            predictions = self.forward(X)
            loss = self.compute_loss(predictions, y)
            self.backward(loss)
            
    def forward(self, X):
        # Forward propagation through layers
        activation = X
        for w, b in zip(self.weights, self.biases):
            activation = tf.nn.relu(tf.matmul(activation, w) + b)
        return activation
`
  },
  {
    name: 'ml_training.py',
    content: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Machine learning model training
def train_model(data, target):
    X_train, X_test, y_train, y_test = train_test_split(data, target, test_size=0.2)
    
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy: {accuracy}")
    
    return model

# Deep learning with neural networks
def create_deep_model():
    model = Sequential([
        Dense(128, activation='relu'),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dense(10, activation='softmax')
    ])
    return model
`
  },
  
  // Web Development - JavaScript/HTML files
  {
    name: 'react_component.js',
    content: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

// React component for web application
const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      {loading ? <Spinner /> : <UserList users={users} />}
    </div>
  );
};

export default UserDashboard;
`
  },
  {
    name: 'frontend_app.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Application</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="hero">
            <h1>Welcome to Our Web Application</h1>
            <p>Building modern web experiences with HTML, CSS, and JavaScript</p>
            <button onclick="handleClick()">Get Started</button>
        </section>
    </main>
    
    <script src="app.js"></script>
</body>
</html>
`
  },
  
  // Backend/API - Java files
  {
    name: 'RestController.java',
    content: `package com.example.api;

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
`
  },
  {
    name: 'DatabaseService.java',
    content: `package com.example.service;

import javax.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DatabaseService {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public void saveEntity(Object entity) {
        entityManager.persist(entity);
    }
    
    public <T> T findById(Class<T> entityClass, Long id) {
        return entityManager.find(entityClass, id);
    }
    
    public void executeQuery(String sql) {
        Query query = entityManager.createNativeQuery(sql);
        query.executeUpdate();
    }
}
`
  },
  
  // Data Processing - CSV/JSON
  {
    name: 'sales_data.csv',
    content: `Date,Product,Quantity,Revenue,Region
2024-01-01,Laptop,15,22500,North
2024-01-01,Mouse,45,1350,South
2024-01-02,Keyboard,30,2400,East
2024-01-02,Monitor,20,8000,West
2024-01-03,Laptop,12,18000,North
2024-01-03,Headphones,50,5000,South
2024-01-04,Webcam,25,3750,East
2024-01-04,Mouse,60,1800,West
`
  },
  {
    name: 'config_data.json',
    content: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "analytics_db",
    "credentials": {
      "username": "admin",
      "password": "encrypted"
    }
  },
  "api": {
    "endpoints": {
      "users": "/api/v1/users",
      "products": "/api/v1/products",
      "orders": "/api/v1/orders"
    },
    "rateLimit": 1000,
    "timeout": 30000
  },
  "analytics": {
    "enabled": true,
    "trackingId": "UA-12345678-1",
    "events": ["pageview", "click", "conversion"]
  }
}
`
  },
  
  // DevOps/Infrastructure - Config files
  {
    name: 'docker-compose.yml',
    content: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/myapp
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    
  redis:
    image: redis:7
    ports:
      - "6379:6379"
    
volumes:
  postgres_data:
`
  },
  {
    name: 'kubernetes_deployment.yml',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_HOST
          value: "postgres-service"
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
`
  }
];

async function createMixedExamples() {
  const mixedDir = path.join(__dirname, 'mixed-files');
  
  try {
    // Create directory
    await fs.mkdir(mixedDir, { recursive: true });
    console.log(`Created directory: ${mixedDir}`);
    
    // Create files
    for (const file of mixedFiles) {
      const filePath = path.join(mixedDir, file.name);
      await fs.writeFile(filePath, file.content.trim());
      console.log(`Created: ${file.name}`);
    }
    
    console.log('\n✅ Mixed file examples created!');
    console.log(`\nFiles created in: ${mixedDir}`);
    console.log('\nExpected clusters:');
    console.log('1. Machine Learning (Python ML files)');
    console.log('2. Web Development (React, HTML, JavaScript)');
    console.log('3. Backend/API (Java Spring files)');
    console.log('4. Data/Config (CSV, JSON, YAML)');
    console.log('\nTo test:');
    console.log('1. Run: npm start');
    console.log('2. Select the "mixed-files" folder');
    console.log('3. Watch semantic clustering across different file types!\n');
    
  } catch (error) {
    console.error('Error creating mixed examples:', error);
  }
}

createMixedExamples();
