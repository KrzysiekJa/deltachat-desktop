def VAR = "true"


pipeline {
    agent any
    
    stages {
        
        stage('Build') {
            steps {
                script{
                    try{
                        echo 'Building...'
                        sh '''
                        curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /var/jenkins_home/docker-compose
                        chmod +x /var/jenkins_home/docker-compose
                        /var/jenkins_home/docker-compose up

                        cd /var/jenkins_home/
                        '''
                        sh 'npm install'
                        sh 'npm run build'
                    }catch (Exception exc){
                        VAR = "false"
                    }
                }
            }
        }
        stage('Test') {
             steps {
                 script{
                     if(VAR == "true"){
                         try{
                            echo 'Testing...'
                            sh 'cd /var/jenkins_home/'
                            sh 'npm run test'
                            sh 'pytest -ra'
                         }catch (Exception exc){
                            VAR = "false"
                         }
                     }
                 }
             }
        }
        stage('Deploy') {
            steps {
                script{
                    if(VAR == "true"){
                        echo 'Deploying....'
                        sh 'docker build -t deltachat-deploy -f Dockerfile-deploy .'
                    }
                }
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
