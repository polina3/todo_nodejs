var socket=null;
Vue.component('t',{
    props: ['data'],
    template:"<div class='task'><h1>{{ data.tasks_name }}</h1><h1>дата начала:</h1><h1><p>{{ data.data_start}}</p></h1><h1>дата конца:</h1><h1><p>{{ data.data_end}}</p></h1><h1>исполнитель:<span>{{data.executor}}</span></h1>",
})

var app = new Vue({
    el:"#app_m",
    data: {
        message: '',
        answer:[],
        name_t:"",
        date_s:"",
        date_e:"",
        ex:[],
        d:"",
        new_login:"",
        new_password:"",
        checked:"",

    },
    created:()=>{
        var socket = io();
        socket.emit('start_m')
        socket.on('q',(data)=>{
            app.answer=data.rez;
        })
    },
    methods:{
        add:()=>{
            var socket = io();
            if(app.name_t=="" || app.date_s==""||app.date_e==""||app.ex==""){
                alert("Обязательные поля не заполнены");
            }
            else{
                socket.emit('adding',[
                    0,
                    app.name_t,
                    app.date_s,
                    app.date_e,
                    app.ex,
                    app.d,
                    0
                ]);
                socket.emit('start_m');
                socket.on('q',(data)=>{
                    app.answer=data.rez;
                    app.name_t="";
                    app.date_s="";
                    app.date_e="";
                    app.ex="";
                    app.d="";
                });
                alert("успех");
            }
        },
        reg:()=>{
            let manager=0;
           
            if(app.name_t=="t"){
                manager=1;
            }
            else{
                manager=0;
            }
            var socket = io();
            socket.emit('reg',[
                app.new_login,
                app.new_password,
                manager
            ]);
            app.new_login="";
            app.new_password="";
            alert("успех");
        }
       
    }
       
    
})
