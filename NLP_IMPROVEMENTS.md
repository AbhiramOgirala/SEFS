# NLP Improvements for Text Clustering

## Overview
Enhanced the semantic clustering engine with advanced NLP techniques for better text similarity detection, especially for TXT and PDF files.

## Key Improvements

### 1. Enhanced Text Preprocessing
- **Stemming**: Uses Porter Stemmer to reduce words to their root form (e.g., "running" → "run")
- **Better Normalization**: Removes punctuation and normalizes whitespace
- **Expanded Stopwords**: More comprehensive list of common words to filter out

### 2. N-gram Analysis
- **Bigrams**: Captures pairs of consecutive words for better context
- Example: "machine learning" is preserved as a meaningful phrase
- Weighted at 0.5 to balance with single terms

### 3. TF-IDF Weighting
- **Term Frequency-Inverse Document Frequency**: Weights terms by importance
- Common terms across all documents get lower weight
- Distinctive terms get higher weight
- Better semantic representation than raw frequency

### 4. Cosine Similarity
- Measures angle between document vectors
- Better for text similarity than Euclidean distance
- Normalized vectors for consistent comparison

### 5. Improved Clustering Algorithm
- **Vector Normalization**: All vectors normalized before clustering
- **Optimal Cluster Detection**: Uses heuristics to determine best number of clusters
- **Cluster Refinement**: Automatically merges very similar clusters (similarity > 0.7)
- **Multiple Iterations**: K-means runs with up to 100 iterations for stability

### 6. Distinctive Cluster Naming
- Names based on terms that distinguish each cluster
- Uses distinctiveness score (cluster frequency / global frequency)
- Excludes bigrams from names for readability
- Limited to 2-3 most distinctive terms

## How It Works

### Text Processing Pipeline
```
Raw Text
  ↓
Tokenization (split into words)
  ↓
Stopword Removal (filter common words)
  ↓
Stemming (reduce to root forms)
  ↓
Bigram Generation (capture phrases)
  ↓
TF-IDF Weighting (calculate importance)
  ↓
Vector Normalization (prepare for clustering)
  ↓
K-means Clustering (group similar documents)
  ↓
Cluster Refinement (merge similar groups)
  ↓
Distinctive Naming (label clusters)
```

### Example
**Document 1**: "Machine learning algorithms for data analysis"
**Document 2**: "Deep learning neural networks for AI"
**Document 3**: "Financial data analysis and reporting"

**Result**:
- Cluster 1: "Learning_Algorithms" (Docs 1, 2)
- Cluster 2: "Financial_Analysis" (Doc 3)

## Benefits for TXT/PDF Files

1. **Better Semantic Understanding**: Captures meaning, not just keywords
2. **Context Awareness**: Bigrams preserve important phrases
3. **Accurate Grouping**: Similar content clusters together regardless of exact wording
4. **Distinctive Labels**: Cluster names reflect actual content themes
5. **Scalable**: Works well with both small and large document collections

## Configuration

The system automatically:
- Determines optimal number of clusters (2 to 8)
- Adjusts based on document count
- Merges overly similar clusters
- Handles edge cases (empty files, single documents, etc.)

## Technical Details

- **Stemmer**: Porter Stemmer (natural library)
- **Clustering**: K-means++ initialization
- **Similarity Metric**: Cosine similarity
- **Weighting**: TF-IDF with smoothing
- **Refinement Threshold**: 0.7 cosine similarity

## Testing

Test with your TXT and PDF files:
1. Place files in the monitored directory
2. Run the application
3. Check cluster assignments in the UI
4. Verify that similar content is grouped together

The clustering should now be much more accurate based on actual text similarity rather than simple word matching.
