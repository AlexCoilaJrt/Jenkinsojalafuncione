pipeline {
    agent any

    tools {
        nodejs 'NodeJS 18'
    }

    environment {
        CHROME_BIN = "/usr/bin/chromium"
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
                    withEnv(["CHROME_BIN=${env.CHROME_BIN}"]) {
                        sh 'npx ng test --no-watch --browsers=ChromeHeadless --code-coverage'
                    }
                }
            }
        }

        stage('Listar contenido capachica-app-main') {
            steps {
                dir('capachica-app-main') {
                    sh 'ls -la'
                }
            }
        }

        stage('Verificar sonar-project.properties') {
            steps {
                dir('capachica-app-main') {
                    sh 'pwd'
                    sh 'ls -l sonar-project.properties || echo "No se encontró sonar-project.properties"'
                    sh 'cat sonar-project.properties || echo "No se pudo leer sonar-project.properties"'
                }
            }
        }

        stage('Análisis Sonar Angular') {
            steps {
                dir('capachica-app-main') {
                    withSonarQubeEnv('sonarqube') {
                        sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=capachica-app-main \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                        '''
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
