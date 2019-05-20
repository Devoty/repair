//SQLite.js
import React, { Component } from 'react';
import SQLiteStorage from 'react-native-sqlite-storage';
import SQLManager from './SQLManager'

SQLiteStorage.DEBUG(true);
var database_name = "sfts.db";//数据库文件
var database_version = "1.0";//版本号
var database_displayname = "MySQLite";
var database_size = -1;
var db;
var sqlManager = new SQLManager();

export default class SQLite extends Component {




    componentWillUnmount(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
    }

    //打开数据库
    open(){
        db = SQLiteStorage.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
            ()=>{
                this._successCB('open');
            },
            (err)=>{
                this._errorCB('open',err);
            });
        return db;
    }

    //创建表
    createTable(tableName){
        if (!db) {
            this.open();
        }
        var sql = "";
        if(tableName==="inspect_job"){
            sql = sqlManager.createInspectJob();
        }
        if(tableName==="equipment_ref_item"){
            sql = sqlManager.createEquipmentRefItem();
        }
        if(tableName==="inspect_equipment_type_conf"){
            sql = sqlManager.createInspectEquipmentTypeConf();
        }
        if(tableName==="inspect_item_conf"){
            sql = sqlManager.createInspectItemConf();
        }
        if(tableName==="inspect_job_manager"){
            sql = sqlManager.createInspectJobManager();
        }
        if(tableName==="job_exec_time"){
            sql = sqlManager.createJobExecTime();
        }
        if(tableName==="man_ref_item"){
            sql = sqlManager.createManRefItem();
        }
        if(tableName==="t_base_equipment_type"){
            sql = sqlManager.createTBaseEquipmentType();
        }
        if(tableName==="t_base_equipment"){
            sql = sqlManager.createTBaseEquipment();
        }

        console.log(sql)
        console.log(">>>>>>>>>>>>")
        //创建用户表
        db.transaction((tx)=> {

            tx.executeSql(sql
                , [], ()=> {
                    this._successCB('executeSql');
                }, (err)=> {
                    this._errorCB('executeSql', err);
                });
        }, (err)=> {//所有的 transaction都应该有错误的回调方法，在方法里面打印异常信息，不然你可能不会知道哪里出错了。
            this._errorCB('transaction', err);
        }, ()=> {
            this._successCB('transaction');
        })
        console.log("<<<<<<<<<<<<<<")
    }

    //关闭数据库
    close(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
        db = null;
    }


    //删除数据
    deleteData(jobData){
        if (!db) {
            this.open();
        }
        let len = jobData.length;
        db.transaction((tx)=>{
            for(let i=0; i<len; i++){
                var job = jobData[i];
                var sql = sqlManager.deleteInspectJob(job.ID);
                tx.executeSql(sql,()=>{
                    },(err)=>{
                        console.log(err);
                    }
                );
            }
        },(error)=>{
            this._errorCB('transaction', error);
        },()=>{
            this._successCB('transaction insert data');
        });
    }

    //删除表
    dropTable(tableName){
        db.transaction((tx)=>{
            var sql = sqlManager.dropTable(tableName);
            tx.executeSql(sql,()=>{
            });
        },(err)=>{
            this._errorCB('transaction', err);
        },()=>{
            this._successCB('transaction');
        });
    }

    //新增数据
    insertData(jobData,tableName){
        let len = jobData.length;
        if (!db) {
            this.open();
        }
        // this.dropTable();
        this.createTable(tableName);
        // this.dropTable();
        db.transaction((tx)=>{
            for(let i=0; i<len; i++){
                var job = jobData[i];
                var sql = sqlManager.insertData(job,tableName);
                tx.executeSql(sql,()=>{
                    },(err)=>{
                        console.log(err);
                    }
                );
            }
        },(error)=>{
            this._errorCB('transaction', error);
        },()=>{
            this._successCB('transaction insert data');
        });
    }


    _successCB(name){
        console.log("SQLiteStorage "+name+" success");
    }
    _errorCB(name, err){
        console.log("SQLiteStorage "+name);
        console.log(err);
    }


    render(){
        return null;
    }
}