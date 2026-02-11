import tensorflow as tf
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