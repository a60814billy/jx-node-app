pipeline {
    agent {
        label "jenkins-nodejs"
    }

    environment {
        ORG = 'a60814billy'
        APP_NAME = 'jx-node-app'
        CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
        DOCKER_REGISTRY_ORG = 'nimble-repeater-208016'
    }

    stages {
        stage('CI Build and push') {
            environment {
                NODE_ENV = 'test'
                POSTGRES_USER = 'user'
                POSTGRES_PASSWORD = 'pass'
                POSTGRES_DB = 'jxapp'
                DB_URL = 'postgresql://user:pass@127.0.0.1/jxapp'
            }
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
                    sh script: "CI=true DISPLAY=:99 npm test", label: "Run testing"
                }
            }
        }

        stage('Build PR') {
            when {
                branch 'PR-*'
            }
            environment {
                PREVIEW_VERSION = "0.0.0-SNAPSHOT-$BRANCH_NAME-$BUILD_NUMBER"
                PREVIEW_NAMESPACE = "$APP_NAME-$BRANCH_NAME".toLowerCase()
                HELM_RELEASE = "$PREVIEW_NAMESPACE".toLowerCase()
            }
            steps {
                container('nodejs') {
                    sh "export VERSION=$PREVIEW_VERSION && skaffold build -f skaffold.yaml"
                    sh "jx step post build --image $DOCKER_REGISTRY/$ORG/$APP_NAME:$PREVIEW_VERSION"
                    dir('./charts/preview') {
                        sh "make preview"
                        sh "jx preview --app $APP_NAME --dir ../.."
                    }
                }
            }
        }

        stage('Build Release') {
            when {
                branch 'master'
            }
            steps {
                container('nodejs') {
                    // ensure we're not on a detached head
                    sh "git checkout master"
                    sh "git config --global credential.helper store"
                    sh "jx step git credentials"

                    // so we can retrieve the version in later steps
                    sh "echo \$(jx-release-version) > VERSION"
                    sh "jx step tag --version \$(cat VERSION)"
                }

                container('nodejs') {
                    sh "export VERSION=`cat VERSION` && skaffold build -f skaffold.yaml"
                    // sh "jx step post build --image $DOCKER_REGISTRY/$ORG/$APP_NAME:\$(cat VERSION)"
                }

                container('nodejs') {
                    dir('./charts/jx-node-app') {
                        sh "jx step changelog --batch-mode --version v\$(cat ../../VERSION)"

                        // release the helm chart
                        sh "jx step helm release"
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
