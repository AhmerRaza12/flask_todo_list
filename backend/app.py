from flask import Flask
import mysql.connector
from flask import make_response,request, jsonify,send_from_directory
import datetime
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'To do list app creation'

@app.route('/user/login', methods=['POST'])
def login():
    try:
        username = request.form['username']
        password = request.form['password']
        qry="select * from users where username='{}' and password='{}'".format(username,password)
        cursor.execute(qry)
        data=cursor.fetchall()
        if len(data)>0:
            return make_response({'payload': data,'message': 'Login successful'}, 200)
        else:
            return make_response({'message': 'Login failed'}, 401)
    except KeyError:
        return make_response({'message': 'Username and password are required'}, 400)


@app.route('/user/signup', methods=['POST'])
def signup():
    try:
        username = request.form['username']
        password = request.form['password']
        name = request.form['name']
        avatar_file = request.files.get('avatar')
        if avatar_file:
            avatar_ext=avatar_file.filename.split('.')[-1]
            new_filename = username+datetime.datetime.now().strftime('%Y%m%d%H%M%S') + '.' + avatar_ext
            avatar_file.save('uploads/'+new_filename)
            file_path = os.path.abspath(os.path.join('uploads', new_filename)).replace("\\", "\\\\")
            qry = "insert into users(username,password,name,avatar) values('{}','{}','{}','{}')".format(username,password,name,file_path)
        else:
            qry = "insert into users(username,password,name) values('{}','{}','{}')".format(username,password,name) 
        cursor.execute(qry)
        return make_response({'message': 'Signup successful'}, 200)
    except KeyError:
        return make_response({'message': 'Username, password, name and avatar are required'}, 400)
    

@app.route('/user/upload/avatar/<uid>',methods=['POST'])
def upload_avatar(uid):
    try:
        avatar_file = request.files.get('avatar')
        if avatar_file:
            get_username_qry="select username from users where id={}".format(uid)
            cursor.execute(get_username_qry)
            username=cursor.fetchall()[0]['username']
            avatar_ext=avatar_file.filename.split('.')[-1]
            new_filename = username+datetime.datetime.now().strftime('%Y%m%d%H%M%S') + '.' + avatar_ext
            avatar_file.save('uploads/'+new_filename)
            file_path = os.path.abspath(os.path.join('uploads', new_filename)).replace("\\", "\\\\")
            qry = "update users set avatar='{}' where id={}".format(file_path,uid)
            cursor.execute(qry)
            return make_response({'message': 'Avatar uploaded successfully'}, 200)
        else:
            return make_response({'message': 'Avatar isnt uploaded'}, 400)      
    except Exception as e:
        return make_response({'message': 'The uid doesnt matched any results'}, 400)
    
@app.route('/uploads/<path:filename>',methods=['GET'])
def get_uploaded_file(filename):
    new_filename = filename.split('/')[-1]
    return send_from_directory('uploads', new_filename)

@app.route('/todo/getall/<uid>',methods=['GET'])
def get_all_todo(uid):
    try:
        qry="select * from tasks where user_id={}".format(uid)
        cursor.execute(qry)
        result =cursor.fetchall()
        if len(result)>0:
            return make_response({'payload': result,'message':f"Details of user with user_id: {uid}"}, 200)
        else:
            return make_response({'message': 'No todos for the user'}, 404)
    except Exception as e:
        return make_response({'message': 'Error in fetching todos'}, 400)
    
@app.route('/todo/add/<uid>',methods=['POST'])
def add_todo_list(uid):
    try:
        description = request.form['description']
        status = request.form['status']
        qry = "insert into tasks(user_id,description,status) values({},'{}','{}')".format(uid,description,status)
        cursor.execute(qry)
        return(make_response({'message': 'Todo list added task successfully'}, 200))
    except:
        return(make_response({'message': 'Error in adding task in todo list'}, 400))

@app.route('/todo/update/<tid>',methods=['PUT'])
def update_todo_list(tid):
    try:
        description = request.form['description']
        status = request.form['status']
        qry = "update tasks set description='{}',status='{}' where id={}".format(description,status,tid)
        cursor.execute(qry)
        return(make_response({'message': 'Todo list updated successfully'}, 200))
    except:
        return(make_response({'message': 'Error in updating task in todo list'}, 400))

@app.route('/todo/delete/<int:tid>', methods=['DELETE'])
def delete_todo_list(tid):
    try:
        qry = "DELETE FROM tasks WHERE id = %s"
        cursor.execute(qry, (tid,))
        if cursor.rowcount > 0:
            return make_response({'message': 'Todo list deleted successfully'}, 200)
        else:
            return make_response({'message': 'Task with the provided ID not found'}, 404)
    except Exception as e:
        print("Error:", e)
        return make_response({'message': 'Error in deleting task in todo list'}, 400)
    
if __name__ == '__main__':
    try:
        con=mysql.connector.connect(host='localhost', user='root', password='root', database='todo_list')
        con.autocommit=True
        cursor=con.cursor(dictionary=True)
    except Exception as e:
        print('Error:',e)
        print('Not connected to the database')
    app.run(debug=True)

