pipeline {
    agent any

    tools {
        nodejs 'NodeJS 18'  // Asegúrate de que este nombre coincida con la configuración de NodeJS en Jenkins
    }

    stages {
        stage('Clonar proyecto Angular') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main', credentialsId: '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', url: 'https://github.com/AlexCoilaJrt/Jenkinsojalafuncione.git'
                }
            }
        }

        stage('Instalar dependencias Angular') {
            steps {
                dir('capachica-app-main') {
                    sh 'npm install'
                }
            }
        }

        stage('Pruebas Unitarias Angular') {
            steps {
                dir('capachica-app-main') {
                    sh 'ng test --no-watch --browsers=ChromeHeadless --code-coverage'
                }
            }
        }

        stage('Análisis Sonar Angular') {
            steps {
                dir('capachica-app-main') {
                    withSonarQubeEnv('sonarqube') {
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                sleep(time: 10, unit: 'SECONDS')
                waitForQualityGate abortPipeline: true
            }
        }
    }
}
