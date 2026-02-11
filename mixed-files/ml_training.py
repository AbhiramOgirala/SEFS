from sklearn.model_selection import train_test_split
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