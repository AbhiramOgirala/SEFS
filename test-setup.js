/**
 * Test Setup Script
 * Creates sample files for testing SEFS functionality
 */

const fs = require('fs').promises;
const path = require('path');

const testFiles = [
  {
    name: 'ml_basics.txt',
    content: `Machine Learning Fundamentals
    
Machine learning algorithms learn patterns from data without explicit programming. 
Supervised learning uses labeled data for training. Unsupervised learning finds 
hidden patterns in unlabeled data. Reinforcement learning learns through trial 
and error with rewards. Neural networks are inspired by biological neurons and 
consist of interconnected layers. Deep learning uses multiple hidden layers to 
learn hierarchical representations.`
  },
  {
    name: 'ai_applications.txt',
    content: `Artificial Intelligence Applications

AI powers recommendation systems, virtual assistants, and autonomous vehicles. 
Computer vision enables facial recognition and object detection. Natural language 
processing allows machines to understand human language. Chatbots provide automated 
customer service. Predictive analytics forecasts future trends. AI assists in 
medical diagnosis and drug discovery.`
  },
  {
    name: 'web_frameworks.txt',
    content: `Modern Web Development Frameworks

React is a component-based library for building user interfaces. Vue.js offers 
progressive framework features with gentle learning curve. Angular provides 
comprehensive framework with TypeScript support. Next.js enables server-side 
rendering for React applications. Express.js is minimal web framework for Node.js. 
Django is high-level Python framework for rapid development.`
  },
  {
    name: 'frontend_tools.txt',
    content: `Frontend Development Tools

Webpack bundles JavaScript modules and assets. Babel transpiles modern JavaScript 
to browser-compatible code. ESLint enforces code quality and style guidelines. 
Prettier formats code automatically. TypeScript adds static typing to JavaScript. 
Sass extends CSS with variables and mixins. PostCSS transforms CSS with plugins.`
  },
  {
    name: 'cloud_services.txt',
    content: `Cloud Computing Services

AWS offers EC2 for virtual servers and S3 for object storage. Azure provides 
comprehensive Microsoft cloud services. Google Cloud Platform excels in data 
analytics and machine learning. Cloud functions enable serverless computing. 
Container orchestration with Kubernetes manages microservices. CDN services 
accelerate content delivery globally.`
  },
  {
    name: 'devops_practices.txt',
    content: `DevOps and CI/CD

Continuous integration automatically builds and tests code changes. Continuous 
deployment automates release to production. Docker containers ensure consistent 
environments. Jenkins orchestrates build pipelines. GitLab CI/CD integrates with 
version control. Infrastructure as code manages resources programmatically. 
Monitoring and logging track application health.`
  },
  {
    name: 'database_systems.txt',
    content: `Database Management Systems

PostgreSQL is powerful open-source relational database. MongoDB stores data in 
flexible JSON-like documents. Redis provides in-memory data structure store. 
MySQL is widely-used relational database. Elasticsearch enables full-text search. 
Cassandra handles large amounts of distributed data. Database indexing improves 
query performance.`
  },
  {
    name: 'security_best_practices.txt',
    content: `Cybersecurity Best Practices

Authentication verifies user identity. Authorization controls access to resources. 
Encryption protects data in transit and at rest. HTTPS secures web communications. 
SQL injection prevention sanitizes database queries. Cross-site scripting protection 
validates user input. Regular security audits identify vulnerabilities. Multi-factor 
authentication adds extra security layer.`
  }
];

async function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  
  try {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
    console.log(`Created test directory: ${testDir}`);
    
    // Create test files
    for (const file of testFiles) {
      const filePath = path.join(testDir, file.name);
      await fs.writeFile(filePath, file.content.trim());
      console.log(`Created: ${file.name}`);
    }
    
    console.log('\n✅ Test setup complete!');
    console.log(`\nTest files created in: ${testDir}`);
    console.log('\nTo test SEFS:');
    console.log('1. Run: npm start');
    console.log('2. Click "Select Root Folder"');
    console.log(`3. Select: ${testDir}`);
    console.log('4. Watch the semantic organization happen!\n');
    
  } catch (error) {
    console.error('Error creating test files:', error);
  }
}

createTestFiles();
