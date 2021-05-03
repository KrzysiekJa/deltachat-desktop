pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                sh '''
                curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /var/jenkins_home/docker-compose
                chmod +x /var/jenkins_home/docker-compose
                /var/jenkins_home/docker-compose up
                '''
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
                cd ./deltachat-desktop
                sh 'npm test'

            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
    post{
        success {
            emailext attachLog: true,
                to: 'kjmj77@gmail.com',
                subject: "Successful Pipeline: ${currentBuild.fullDisplayName}",
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}"
        }
        failure {
            emailext attachLog: true,
                to: 'kjmj77@gmail.com',
                subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
                body: "Something is wrong with ${env.BUILD_URL}"
        }
    }
}
