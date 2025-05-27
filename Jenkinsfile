pipeline {
    agent any

    tools {
        nodejs 'NodeJS 18' // Usa una versión compatible con Angular 18 (por ejemplo, Node 20.11.1 o superior)
    }

    environment {
        CHROME_BIN = "/usr/bin/google-chrome" // Asegura que Chrome esté disponible
    }

    stages {
        stage('Clonar proyecto Angular') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main', 
                        credentialsId: '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', 
                        url: 'https://github.com/AlexCoilaJrt/Jenkinsojalafuncione.git'
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
                    sh 'npx ng test --no-watch --browsers=ChromeHeadless --code-coverage'
                }
            }
        }

        stage('Análisis Sonar Angular') {
            steps {
                dir('capachica-app-main') {
                    withSonarQubeEnv('sonarqube') {
                        sh 'npx sonar-scanner'
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
