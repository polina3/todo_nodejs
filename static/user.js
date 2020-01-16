var socket=null;
Vue.component('t',{
    data:()=>{
        return{
            show:false
        }
        
    }   ,
    props: ['data'],
    template:"<div class='task'><h1>{{ data.tasks_name }}</h1><p v-if='show'>{{data.description}}</p><p>дата начала:</p><p>{{ new Date(data.data_start)}}</p><p>дата конца:</p><p>{{ new Date(data.data_end)}}</p><button v-on:click='remove(data.id)'>Сделанно</button><button v-on:click='show = !show'>Описание</button></div>",
    methods:{
        remove:function (message){
            var socket = io();
            socket.emit('remove',message);
            socket.emit('start_u');
            socket.on('q',(data)=>{
                app.answer=data.rez;
            })
        }
   
       
    }
})
var app = new Vue({
    el:"#app_u",
    data: {
        message: '',
        answer:[],
        show: false
    },
    beforeCreate:()=>{
        var socket = io(); 
    },
    created:()=>{
        var socket = io();
        socket.emit('start_u');
        socket.on('q',(data)=>{
            app.answer=data.rez;
        })
    },
    mounted:()=>{
       
    }
})
