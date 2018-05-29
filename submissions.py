from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home_page():
    return render_template('blueprint.html')


@app.route('/forex')
def forex_home_page():
    return render_template('forex/base.html')


@app.route('/forex/submissions')
def forex_submissions_page():
    return render_template('forex/submissions/member_quality.html')


@app.route('/forex/submissions/member')
def forex_member_quality_page():
    return render_template('forex/submissions/member_quality.html')


@app.route('/forex/submissions/market')
def forex_market_quality_page():
    return render_template('forex/submissions/market_quality.html')


@app.route('/forex/fancy_menu')
def fancy_menu():
    return render_template('forex/fancy_menu.html')


if __name__ == '__main__':
    app.run('localhost', 5001)

