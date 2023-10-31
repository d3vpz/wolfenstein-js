const canvas=document.getElementById('screen');
const context=canvas.getContext('2d');

// FPS
const FPS=60;
const cycle_delay=Math.floor(1000/FPS);
var old_cycle_time=0;
var cycle_count=0;
var fps_rate='...';

// map
const MAP_SIZE=8;
const MAP_SCALE=10;
const MAP_RANGE=MAP_SIZE*MAP_SCALE;
const MAP_SPEED=(MAP_SCALE/2)/10;
var map=[
    1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,1,1,0,1,
    1,0,1,0,0,1,0,1,
    1,0,1,0,0,1,0,1,
    1,0,1,1,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,
];

// player
var player={
    "x":MAP_SCALE+20,
    "y":MAP_SCALE+20,
    "angle":Math.PI/3,
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
    // update screen
    context.fillStyle='black';
    context.fillRect(canvas.width/2-HALF_WIDTH,canvas.height/2-HALF_HEIGHT,WIDTH,HEIGHT);

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

    // infinite loop
    setTimeout(game_loop,cycle_delay);

    //render FPS to screen
    context.fillStyle='black';
    context.font='12px Monospace';
    context.fillText('FPS: '+fps_rate,0,20);

} window.addEventListener('load',()=>{game_loop();});