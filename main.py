from flask import Flask

app = Flask(__name__)

@app.route('/number')
def get_number():
    return '80'

if __name__ == '__main__':
    app.run(debug=True)
