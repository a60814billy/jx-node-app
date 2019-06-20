pipeline {
    agent {
        label "jenkins-nodejs"
    }

    environment {
        ORG = 'a60814billy'
        APP_NAME = 'jx-node-app'
        NODE_ENV = 'test'
        DB_URL = 'postgresql://postgres/jxapp'
    }

    stages {
        stage('CI Build and push') {
            steps {
                container('postgres') {
                    sh "createdb jxapp"
                }
                container('nodejs') {
                    sh "npm install"
                    sh "npx standard"
                    sh "npm test"
                }
            }
        }
    }
}
