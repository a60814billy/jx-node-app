def isTimerBuild = isJobStartedByTimer()

pipeline {
    agent {
        label "jenkins-nodejs8x-hackmd"
    }

    triggers {
        cron('H/3 * * * *')
    }

    environment {
        ORG = 'a60814billy'
        APP_NAME = 'jx-node-app'
        CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
        DOCKER_REGISTRY_ORG = 'nimble-repeater-208016'
    }

    stages {
        stage('Setup') {
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
                        sleep 3
                    """, label: "Start database for testing"
                }

            }
        }

        stage('Build') {
            steps {
                container('nodejs') {
                    sh script: "npm install", label: "Install npm dependencies"
                }
            }
        }

        stage('--') {
            when {
                expression {
                    isTimerBuild == true
                }
            }
            steps {
                container('nodejs') {
                    echo "--"
                }
            }
        }

        stage('Test') {
            steps {
                container('nodejs') {
                    echo "pass"
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
                    sh script: "export VERSION=$PREVIEW_VERSION && skaffold build -f skaffold.yaml", label: "build preview docker image"
                    sh script: "jx step post build --image $DOCKER_REGISTRY/$ORG/$APP_NAME:$PREVIEW_VERSION", label: "start scan docker image"
                    dir('./charts/preview') {
                        sh script: "make preview", label: "make preview helm chart"
                        sh script: "jx preview --app $APP_NAME --dir ../..", label: "deploy preview app"
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


@NonCPS
def isJobStartedByTimer() {
    try {
        for ( buildCause in currentBuild.getBuildCauses() ) {
            if (buildCause != null) {
                if (buildCause.shortDescription.contains("Started by timer")) {
                    echo "build started by timer"
                    return true
                }
            }
        }
    } catch(theError) {
        echo "Error getting build cause: ${theError}"
    }
    return false
}
