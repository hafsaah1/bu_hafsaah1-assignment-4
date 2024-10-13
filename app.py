from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

# Fetch dataset and prepare the vectorizer
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data

# Initialize TF-IDF Vectorizer and fit it on the dataset
vectorizer = TfidfVectorizer(stop_words=stopwords.words('english'), max_features=10000)
X = vectorizer.fit_transform(documents)

# Apply SVD for dimensionality reduction
svd = TruncatedSVD(n_components=100)
X_reduced = svd.fit_transform(X)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    """
    # Transform the query using the vectorizer and reduce its dimensionality
    query_vec = vectorizer.transform([query])
    query_reduced = svd.transform(query_vec)

    # Compute cosine similarity between query and all documents
    similarities = cosine_similarity(query_reduced, X_reduced)
    similarities = similarities.flatten()

    # Get indices of top 5 documents
    top_indices = similarities.argsort()[-5:][::-1]
    top_similarities = similarities[top_indices]
    top_documents = [documents[i] for i in top_indices]
    
    return top_documents, top_similarities, top_indices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities.tolist(), 'indices': indices.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
