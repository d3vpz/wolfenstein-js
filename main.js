const canvas=document.getElementById('screen');
const context=canvas.getContext('2d');

// FPS
const FPS=60;
const cycle_delay=Math.floor(1000/FPS);
var old_cycle_time=0;
var cycle_count=0;
var fps_rate='...';

// map
const MAP_SIZE=10;
const MAP_SCALE=10;
const MAP_RANGE=MAP_SIZE*MAP_SCALE;
const MAP_SPEED=(MAP_SCALE/2)/10;
var map=[
    1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,1,1,0,0,0,1,
    1,0,0,0,1,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,
];

// camera
const PI=Math.PI;
const DOUBLE_PI=Math.PI*2;

// player
var player={
    // should config
    'x':MAP_SCALE+10,
    'y':MAP_SCALE+10,
    'angle':PI/3,
    // shouldn't config
    'move_x':0,
    'move_y':0,
    'move_angle':0
};

// handle user input
document.onkeydown=function(e){
    console.log(e.key);
    switch(e.key){
        case 'ArrowDown':player.move_x=-1;player.move_y=-1;break;
        case 'ArrowUp':player.move_x=1;player.move_y=1;break;
        case 'ArrowRight':player.move_angle=-1;break;
        case 'ArrowLeft':player.move_angle=1;break;
    }
};

document.onkeyup=function(e){
    switch(e.key){
        case'ArrowDown':
        case'ArrowUp':player.move_x=0;player.move_y=0;break;
        case'ArrowRight':
        case'ArrowLeft':player.move_angle=0;break;
    }
};

// screen
const WIDTH=300,HALF_WIDTH=150;
const HEIGHT=200,HALF_HEIGHT=100;

// game loop
function game_loop(){
    // calculate FPS
    cycle_count++;
    if(cycle_count>=60)cycle_count=0;
    var start_time=Date.now();
    var cycle_time=start_time-old_cycle_time;
    old_cycle_time=start_time;
    if(cycle_count%60==0)fps_rate=Math.floor(1000/cycle_time);

    // resize canvas
    canvas.width=window.innerWidth*0.3;
    canvas.height=window.innerHeight*0.3;
    context.imageSmoothingEnabled=false;

    context.beginPath();

    // update screen
    context.fillStyle='black';
    context.fillRect(canvas.width/2-HALF_WIDTH,canvas.height/2-HALF_HEIGHT,WIDTH,HEIGHT);

    // update player position
    var player_offset_x=Math.sin(player.angle)*MAP_SPEED;
    var player_offset_y=Math.cos(player.angle)*MAP_SPEED;
    var map_target_x=Math.floor(player.y/MAP_SCALE)*MAP_SIZE+Math.floor((player.x+player_offset_x*player.move_x)/MAP_SCALE);
    var map_target_y=Math.floor((player.y+player_offset_y*player.move_y)/MAP_SCALE)*MAP_SIZE+Math.floor(player.x/MAP_SCALE);

    if(player.move_x&&map[map_target_x]==0)player.x+=player_offset_x*player.move_x;
    if(player.move_y&&map[map_target_y]==0)player.y+=player_offset_y*player.move_y;
    if(player.move_angle)player.angle+=0.06*player.move_angle;

    // draw map
    let offset_x=Math.floor(canvas.width/2-MAP_RANGE/2);
    let offset_y=Math.floor(canvas.height/2-MAP_RANGE/2);

    for(var row=0;row<MAP_SIZE;row++){
        for(var col=0;col<MAP_SIZE;col++){
            var square=row*MAP_SIZE+col;
            if(map[square]){
                context.fillStyle='white';
                context.fillRect(
                    offset_x+col*MAP_SCALE,
                    offset_y+row*MAP_SCALE,
                    MAP_SCALE,MAP_SCALE
                    );
            }else{
                context.fillStyle='gray';
                context.fillRect(
                    offset_x+col*MAP_SCALE,
                    offset_y+row*MAP_SCALE,
                    MAP_SCALE,MAP_SCALE
                    );
            }
        }
    }

    var player_map_x=player.x+offset_x;
    var player_map_y=player.y+offset_y;

    var angle_sin=Math.sin(player.angle);
    var angle_cos=Math.cos(player.angle);

    context.fillStyle='red';
    context.arc(player_map_x,player_map_y,2,0,DOUBLE_PI);
    context.fill();
    context.strokeStyle='red';
    context.lineWidth=1;
    context.moveTo(player_map_x,player_map_y);
    context.lineTo(player_map_x+angle_sin*7,player_map_y+angle_cos*7);
    context.stroke();

    // infinite loop
    setTimeout(game_loop,cycle_delay);

    //render FPS to screen
    context.fillStyle='black';
    context.font='12px Monospace';
    context.fillText('FPS: '+fps_rate,0,20);

} window.addEventListener('load',()=>{game_loop();});