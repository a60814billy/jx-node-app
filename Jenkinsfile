pipeline {
    agent {
        label "jenkins-nodejs"
    }

    environment {
        ORG = 'a60814billy'
        APP_NAME = 'jx-node-app'
        NODE_ENV = 'test'
        POSTGRES_USER = 'user'
        POSTGRES_PASSWORD = 'pass'
        POSTGRES_DB = 'jxapp'
        DB_URL = 'postgresql://user:pass@127.0.0.1/jxapp'
    }

    stages {
        stage('CI Build and push') {
            steps {
                container('postgres') {
                    sh script: """
                        export POSTGRES_USER=${env.POSTGRES_USER}
                        export POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD}
                        export POSTGRES_DB=${env.POSTGRES_DB}
                        /usr/local/bin/docker-entrypoint.sh postgres > /dev/null &
                        sleep 10
                    """, label: "Start database for testing"
                }
                container('nodejs') {
                    sh script: "npm install", label: "Install npm dependencies"
                    sh script: "npx standard", label: "Run code style lint"
                    sh script: "npm test", label: "Run testing"
                }
            }
        }
    }
}
