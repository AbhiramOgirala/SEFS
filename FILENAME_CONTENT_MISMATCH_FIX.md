# Filename-Content Mismatch Detection

## Problem
Files with misleading names (e.g., "ML_Algorithims.pdf" containing climate content) were clustering incorrectly because the system used the filename when PDF extraction failed.

## Example
- **Filename**: "ML_Algorithims.pdf"
- **Actual Content**: "Climate Change Overview..."
- **Old Behavior**: Clustered with ML files (based on filename)
- **New Behavior**: Clustered with climate files (based on content)

## Solution
Added intelligent mismatch detection that:
1. Analyzes the filename for topic keywords
2. Analyzes the content for topic keywords
3. Detects mismatches between filename and content
4. Uses content for clustering when mismatch is detected

## How It Works

### Topic Detection
The system recognizes these topics:
- **ML/AI**: machine, learning, neural, algorithm, model, training
- **Security**: security, cyber, threat, attack, firewall, encryption
- **Climate**: climate, weather, temperature, emission, warming
- **Fruit/Nutrition**: fruit, vitamin, nutrition, apple, banana

### Detection Process
```
1. Extract content from file
2. Check if content is duplicate (PDF caching issue)
3. If duplicate:
   a. Analyze filename for topic keywords
   b. Analyze content for topic keywords
   c. If mismatch detected:
      → Use CONTENT for clustering (ignore filename)
   d. If no mismatch:
      → Use FILENAME for clustering (as fallback)
4. If not duplicate:
   → Use CONTENT normally
```

### Example Output
```
⚠️  Duplicate content detected for ML_Algorithims.pdf, using filename instead
⚠️  MISMATCH: Filename sugg