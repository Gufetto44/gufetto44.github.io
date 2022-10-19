
// config params
const nextPageURL = "http://www.w3schools.com";
const maxFood = 10;
const cellSize = 10;
const tickRate = 10;
const frameRate = 60;

const boardColor = {fill: "#996600", border: "#FF5511"}
const snakeColor = {fill: "#ffcc66", border: "#111111"}
const snakeEaten = {fill: "#22CC22aa", border: "#111111"}
const foodColor = {fill: "#22CC22", border: "#115511"}

const progressbar = {fill: "#80ff80AA", border: "#115511", height: 3, smooth: .2}

const camelboard = document.getElementById("gameCanvas");
const draw_ctx = gameCanvas.getContext("2d");


let snake = null
let food = null;
let foodEaten = 0;
let dir = {x: 1, y:0};


let requestedDir = {x:1, y:0};

init();
main();
mainDraw();

function resetGameplay()
{
    snake =
    [
        {x:4, y:4, isEaten: false},
        {x:4, y:5, isEaten: false},
        {x:4, y:6, isEaten: false},
        {x:4, y:7, isEaten: false}
    ];

    dir = {x: 1, y:0};
    requestedDir = {x: 1, y:0};
    foodEaten = 0;
    generateFood();

}

function mouseInputs(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let cell = getCell({x,y});

    let head = snake[0];
    let diff = {x: cell.x - head.x, y: cell.y - head.y};

    let ax = Math.abs(diff.x);
    let ay = Math.abs(diff.y);

    if (ax>ay)
    {
        if (diff.x<0) GoLeft(); else GoRight();
    }
    else
    {
        if (diff.y<0) GoUp(); else GoDown();
    }

    console.log("x: " + cell.x + " y: " + cell.y)
}


function init()
{
    camelboard.addEventListener('mousedown', function(e) {
        mouseInputs(camelboard, e)
    })
    document.addEventListener("keydown", inputs);
    resetGameplay();
}

function setDrawColors(style)
{
    //set colors
    draw_ctx.fillStyle = style.fill;
    draw_ctx.strokestyle = style.border;
}

function drawSnakeSection(snakePart)
{
    if (snakePart.isEaten === true)
        setDrawColors(snakeEaten);
    else
        setDrawColors(snakeColor);
    
    //calculate coords
    let px = snakePart.x * cellSize;
    let py = snakePart.y * cellSize;

    //draw section
    draw_ctx.fillRect(px, py, cellSize, cellSize);
    draw_ctx.strokeRect(px, py, cellSize, cellSize);
}

function drawSnakeMovement(dir)
{
    setDrawColors(foodColor);
    
    let k = snake[0];

    let kx = k.x + requestedDir.x;
    let ky = k.y + requestedDir.y;
    //calculate coords
    let px = kx * cellSize;
    let py = ky * cellSize;

    //draw section
    draw_ctx.fillRect(px, py, cellSize, cellSize);
    draw_ctx.strokeRect(px, py, cellSize, cellSize);
}

function drawFood()
{
    if (food == null) return;

    setDrawColors(foodColor);

    //calculate coords
    let px = food.x * cellSize;
    let py = food.y * cellSize;

    //draw section
    draw_ctx.fillRect(px, py, cellSize, cellSize);
    draw_ctx.strokeRect(px, py, cellSize, cellSize);
}

function drawFullSnake()
{
    for (let i = 0; i < snake.length; i++) {
        const section = snake[i];
        
        drawSnakeSection(section);
    }
}

let _smoothPercent = 0.0;

function lerp(v1, v2, t)
{
    return (v1 + ((v2-v1) * t));
}
function drawProgressBar()
{
    setDrawColors(progressbar);
    let percent = foodEaten / maxFood;

    _smoothPercent = lerp(_smoothPercent, percent, progressbar.smooth);

    let w = camelboard.width * _smoothPercent;
    let h = camelboard.height;

    draw_ctx.fillRect(0, h-progressbar.height, w, progressbar.height);
}

function clear()
{
    let width = Math.ceil(camelboard.width / cellSize) * cellSize;
    let height = Math.ceil(camelboard.height / cellSize) * cellSize;
    setDrawColors(boardColor);

    draw_ctx.fillRect(0,0, width, height);
    //draw_ctx.strokeRect(2,2, width-4, height-4);
}

//let actualDir = dir;

function getCell(point)
{
    let coord = {x:0, y:0};

    let x = Math.floor(point.x / cellSize);
    let y = Math.floor(point.y / cellSize);

    return {x, y};
}

function dot(d1, d2)
{
    return ((d1.x * d2.x) + (d1.y * d2.y));
}

function move_snake()
{
    dir.x = requestedDir.x;
    dir.y = requestedDir.y;

    let width = Math.ceil(camelboard.width / cellSize);
    let height = Math.ceil(camelboard.height / cellSize);

    let oldHead = snake[0];
    let head = {x: oldHead.x + dir.x, y:oldHead.y + dir.y};
    
    if (head.x<0)
        head.x = width-1;
    if (head.x>width)
        head.x = 0;
    
    if (head.y<0)
        head.y = height-1;
    if (head.y>=height)
        head.y = 0;
    
    let isFine = checkSnakeHead(head);

    if (isFine)
    {
        snake.unshift(head);
        snake.pop();
    }
}

function gameTick()
{
    move_snake();
}

function tick()
{
    gameTick();
    main();
}

function DrawTick()
{
    clear();
    drawFood();
    drawFullSnake();
    //drawSnakeMovement();
    drawProgressBar();
    mainDraw();
}


function checkSnakeHead(head)
{
    //let head = snake[0];

    if (isPositionFood(head))
    {
        snakeEat();
    }
    else if (isPositionSnake(head))
    {
        init();
        return false;
    }
    return true;
}

function snakeEat()
{
    foodEaten++;

    let newBlock = 
    {
        x: food.x,
        y: food.y,
        isEaten: true,
    };

    snake.push(newBlock);

    food = null;
    if (foodEaten>=maxFood)
        setTimeout(snakeWin, 500);
    else
        generateFood();
}

function snakeWin()
{
    window.location.href = nextPageURL;
}

function isPositionFood(pos)
{
    if (food==null) return false;

    const sec = food;
    
    if (sec.x === pos.x && sec.y === pos.y)
        return true;
    
    return false;
}

function isPositionSnake(pos)
{
    for (let i = 0; i < snake.length; i++) {
        const sec = snake[i];
        
        if (sec.x === pos.x && sec.y === pos.y)
            return true;
    }
    return false;
}

function generateFood()
{
    let width = Math.ceil(camelboard.width / cellSize);
    let height = Math.ceil(camelboard.height / cellSize);

    let freePos = [];

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let p = {x: x, y: y};
            
            if (!isPositionSnake(p))
                freePos.push(p);
        }
    }
    let randIndex = Math.ceil(Math.random() * freePos.length);

    food = freePos[randIndex];
}


function inputs()
{
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    let keyPressed = event.keyCode;

    if (keyPressed === LEFT_KEY) GoLeft(); 

    if (keyPressed === UP_KEY) GoUp();

    if (keyPressed === RIGHT_KEY) GoRight();

    if (keyPressed === DOWN_KEY) GoDown();
}

function GoLeft()
{
    let goingRight = dir.x === 1;  
    
    if (!goingRight)
    {    
        requestedDir.x = -1;
        requestedDir.y = 0;  
    }
}

function GoRight()
{
    let goingLeft = dir.x === -1;

    if (!goingLeft)
    {    
        requestedDir.x = 1;
        requestedDir.y = 0;  
    }
}

function GoUp()
{
    let goingDown = dir.y === 1;

    if (!goingDown)
    {    
        requestedDir.x = 0;
        requestedDir.y = -1;  
    }
}

function GoDown()
{
    let goingUp = dir.y === -1;

    if (!goingUp)
    {    
        requestedDir.x = 0;
        requestedDir.y = 1;  
    }
}

function main()
{
    setTimeout(tick, 1000/tickRate);
}

function mainDraw()
{
    setTimeout(DrawTick, 1000/frameRate);

}