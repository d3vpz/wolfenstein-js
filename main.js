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
    1,0,0,0,0,0,0,1,1,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,1,1,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,
    1,0,0,1,0,0,0,0,0,1,
    1,0,0,1,0,0,0,1,0,1,
    1,1,1,1,1,1,1,1,1,1,
];
var show_map=false;

// screen
const WIDTH=300,HALF_WIDTH=WIDTH/2;
const HEIGHT=200,HALF_HEIGHT=HEIGHT/2;

// camera
const PI=Math.PI;
const DOUBLE_PI=Math.PI*2;
const FOV=PI/3;
const HALF_FOV=FOV/2;
const STEP_ANGLE=FOV/WIDTH;

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
        case'ArrowDown':player.move_x=-1;player.move_y=-1;break;
        case'ArrowUp':player.move_x=1;player.move_y=1;break;
        case'ArrowRight':player.move_angle=-1;break;
        case'ArrowLeft':player.move_angle=1;break;
        case'Shift':show_map=true;break;
    }
};

document.onkeyup=function(e){
    switch(e.key){
        case'ArrowDown':
        case'ArrowUp':player.move_x=0;player.move_y=0;break;
        case'ArrowRight':
        case'ArrowLeft':player.move_angle=0;break;
        case'Shift':show_map=false;break;
    }
};

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

    // calculate map and player offsets
    let offset_x=Math.floor(canvas.width/2)-149;
    let offset_y=Math.floor(canvas.height/2)-99;
    var player_map_x=player.x+offset_x;
    var player_map_y=player.y+offset_y;

    // raycasting
    var current_angle=player.angle+HALF_FOV;
    var ray_start_x=Math.floor(player.x/MAP_SCALE)*MAP_SCALE;
    var ray_start_y=Math.floor(player.y/MAP_SCALE)*MAP_SCALE;

    // loop over casted rays
    for(var ray=0;ray<WIDTH;ray++){
        // get current angle sin and cos
        var current_sin=Math.sin(current_angle);current_sin=current_sin?current_sin:0.000001;
        var current_cos=Math.cos(current_angle);current_cos=current_cos?current_cos:0.000001;

        // vertical line intersection
        var ray_end_x,ray_end_y,ray_dir_x,vertical_depth;
        if(current_sin>0){ray_end_x=ray_start_x+MAP_SCALE;ray_dir_x=1;}
        else{ray_end_x=ray_start_x;ray_dir_x=-1;}
        for(var offset=0;offset<MAP_RANGE;offset+=MAP_SCALE){
            vertical_depth=(ray_end_x-player.x)/current_sin;
            ray_end_y=player.y+vertical_depth*current_cos;
            var map_target_x=Math.floor(ray_end_x/MAP_SCALE);
            var map_target_y=Math.floor(ray_end_y/MAP_SCALE);
            if(current_sin<=0)map_target_x+=ray_dir_x;
            var target_square=map_target_y*MAP_SIZE+map_target_x;
            if(target_square<0||target_square>map.length-1)break;
            if(map[target_square]!=0)break;
            ray_end_x+=ray_dir_x*MAP_SCALE;
        }

        // horizontal line intersection
        var ray_end_y,ray_end_x,ray_dir_y,horiz_depth;
        if(current_cos>0){ray_end_y=ray_start_y+MAP_SCALE;ray_dir_y=1;}
        else{ray_end_y=ray_start_y;ray_dir_y=-1;}
        for(var offset=0;offset<MAP_RANGE;offset+=MAP_SCALE){
            horiz_depth=(ray_end_y-player.y)/current_cos;
            ray_end_x=player.x+horiz_depth*current_sin;
            var map_target_x=Math.floor(ray_end_x/MAP_SCALE);
            var map_target_y=Math.floor(ray_end_y/MAP_SCALE);
            if(current_cos<=0)map_target_y+=ray_dir_y;
            var target_square=map_target_y*MAP_SIZE+map_target_x;
            if(target_square<0||target_square>map.length-1)break;
            if(map[target_square]!=0)break;
            ray_end_y+=ray_dir_y*MAP_SCALE;
        }

        // render 3D projection
        var depth=vertical_depth<horiz_depth?depth=vertical_depth:depth=horiz_depth;
        depth*=Math.cos(player.angle-current_angle);

        var wall_height=Math.min(MAP_SCALE*300/(depth+0.0001),HEIGHT);
        context.beginPath();
        context.strokeStyle=vertical_depth<horiz_depth?'#aaa':'#555';
        context.moveTo(ray+offset_x,(HALF_HEIGHT-wall_height/2)+offset_y);
        context.lineTo(ray+offset_x,(HALF_HEIGHT-wall_height/2)+wall_height+offset_y);
        context.stroke();

        // update current angle
        current_angle-=STEP_ANGLE;
    }

    // draw 2d map
    if(show_map){
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

        // draw player on 2d map
        context.beginPath();
        context.fillStyle='red';
        context.arc(player_map_x,player_map_y,2,0,DOUBLE_PI);
        context.fill();
    }

    // infinite loop
    setTimeout(game_loop,cycle_delay);

    //render FPS to screen
    context.fillStyle='black';
    context.font='12px Monospace';
    context.fillText('FPS: '+fps_rate,0,20);

} window.addEventListener('load',()=>{game_loop();});
