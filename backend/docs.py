from flask import Flask
from flask_cors import CORS

from artifacts import artifacts_bp
from onboarding import onboarding_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(artifacts_bp)
app.register_blueprint(onboarding_bp)

if __name__ == '__main__':
    app.run(debug=True)

