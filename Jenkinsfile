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
                sh 'docker-compose build --no-cache'
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
                to: 'kjarek@student.agh.edu.pl',
                subject: "Successful Pipeline: ${currentBuild.fullDisplayName}",
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}"
        }
        failure {
            emailext attachLog: true,
                to: 'kjarek@student.agh.edu.pl',
                subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
                body: "Something is wrong with ${env.BUILD_URL}"
        }
    }
}
