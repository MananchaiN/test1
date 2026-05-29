from flask import Flask

app = Flask(__name__)

@app.route('/simple-api')
def get_number():
    return str(99)

if __name__ == '__main__':
    app.run(debug=True)
