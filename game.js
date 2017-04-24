var buttonStart = document.getElementById("start");
var canvasGame = document.getElementById("canv");
var c = canvasGame.getContext("2d");
var cWidth = 700;
var cHeight = 500;
var intervalTitle = 300;
var framesPS = 50;
var intervalGame = 1000/framesPS;
var iSpeed = 1;
var dSpeed = 5;
var deSpeed = 1;
var ceSpeed = 1;
var styleIR = "#ff0000"; 
var lineIR = 2;
var styleDR = "#0000ff"; 
var lineDR = 2;
var expRad = 30;
var frame = 0;
var gameOn = false;

var cityImage = new Image();
cityImage.src = "office.png";
var rocketImage = new Image();
rocketImage.src = "rocket.png";
cityImage.onload = function() {
	rocketImage.onload = function() {
		initialSetup();
		titlePulse = setTimeout(titleDown, intervalTitle);
	}
}

/*--------------------- events -----------------------------*/

buttonStart.onclick = function() {
	clearTimeout(titlePulse);
	initialSetup();
	gameOn = true;
	mainGame = setInterval(mainLoop, intervalGame);
	this.style.display = "none";
};

canvasGame.onclick = function(event) {
	var endPosition;
	if (gameOn) {
		endPosition = getCursorPosition(this, event);
		defenderRockets.push(new DefenderRocket(endPosition));
	}
}
/*-------------------- functions ----------------------------*/

function initialSetup() {
	var x = 95;
	var y = cHeight - 32;
	cities = [];
	for (var i = 0; i < 6; i++) {
		cities.push(new City(x, y));
		x += 80;
		if (i == 2) x += 80;
	}
	launchers = [new Launcher(0), new Launcher(1), 
	             new Launcher(2)];
	inviderRockets = [];
	defenderRockets = [];
	rocketExplosions = [];
	cityExplosions = [];
	scores = 0;

	initialScreen();
	document.getElementById("game-scores").innerHTML = "0";
}

function initialScreen() {
	c.clearRect(0, 0, cWidth, 500);
	c.fillStyle = "#00ff00";
	c.fillRect(0, 470, 700, 30);
	for (var i = 0; i < cities.length; i++) {
		if (cities[i].alive)
			c.drawImage(cityImage, 0, 0, 32, 32, cities[i].x1, cities[i].y1, 32, 32);
	}
	var x = 10;
	for (var i = 0; i < 3; i++) {
		c.drawImage(rocketImage, 0, 0, 32, 32, x, 468, 32, 32);
		x += 325;
	}	
}

function titleDown() {
	initialScreen();
	c.fillStyle = "#ffcccc";
	c.strokeStyle = "#ff0000";
	c.font = "60px Arial";
	c.fillText("Missile", 250, 150);
	c.strokeText("Missile", 250, 150);
	c.fillText("Command", 200, 250);
	c.strokeText("Command", 200, 250);
	titlePulse = setTimeout(titleUp, intervalTitle);
}

function titleUp() {
	initialScreen();
	c.fillStyle = "#ffcccc";
	c.strokeStyle = "#ff0000";
	c.font = "65px Arial";
	c.fillText("Missile", 230, 150);
	c.strokeText("Missile", 230, 150);
	c.fillText("Command", 180, 250);
	c.strokeText("Command", 180, 250);
	titlePulse = setTimeout(titleDown, intervalTitle);
}

function mainLoop() {
	initialScreen();

	updateInviderRockets();
	drawInviderRockets();

	updateDefenderRockets();
	drawDefenderRockets();

	updateRocketExplosions();
	drawRocketExplosions();

	updateCityExplosions();
	drawCityExplosions();

	checkInvider();
	checkDefender();

	frame++;
}

function updateInviderRockets() {
	if (frame % framesPS == 0)
		inviderRockets.push(new InviderRocket());
	for (var i in inviderRockets) {
		if (inviderRockets[i].currentCoords[0] < 0 
			|| inviderRockets[i].currentCoords[0] > cWidth
			|| inviderRockets[i].currentCoords[1] < 0
			|| inviderRockets[i].currentCoords[1] > cHeight) {
			delete(inviderRockets[i]);
		} else {
			inviderRockets[i].currentCoords[0] += 
		                                   inviderRockets[i].dx;
			inviderRockets[i].currentCoords[1] += 
		                                   inviderRockets[i].dy;
		}
	}
}

function updateDefenderRockets() {
	var goal0, goal1;
	for (var i in defenderRockets) {
		if (defenderRockets[i].currentCoords[0] < 0 
			|| defenderRockets[i].currentCoords[0] > cWidth
			|| defenderRockets[i].currentCoords[1] < 0
			|| defenderRockets[i].currentCoords[1] > cHeight) {
			delete(defenderRockets[i]);
		} else {
			defenderRockets[i].currentCoords[0] += 
		                                   defenderRockets[i].dx;
			defenderRockets[i].currentCoords[1] += 
		                                   defenderRockets[i].dy;
		    if (defenderRockets[i].currentCoords[1] < defenderRockets[i].goal1) {
		    	goal0 = defenderRockets[i].goal0;
		    	goal1 = defenderRockets[i].goal1; 
		    	rocketExplosions.push(new RocketExplosion(goal0, goal1));
		    	delete(defenderRockets[i]);
		    }
		}
	}
}

function updateRocketExplosions() {
	for (var i in rocketExplosions) {
		rocketExplosions[i].radius += deSpeed;
		if (rocketExplosions[i].radius > expRad)
			delete(rocketExplosions[i]);
	}
}

function updateCityExplosions() {
	for (var i in cityExplosions) {
		cityExplosions[i].radius += ceSpeed;
		if (cityExplosions[i].radius > 32)
			delete(cityExplosions[i]);
	}
}

function drawInviderRockets() {
	c.strokeStyle = styleIR;
	c.lineWidth = lineIR;
	for (var i in inviderRockets) {
		c.beginPath();
		c.moveTo(inviderRockets[i].initialCoords[0], 
			     inviderRockets[i].initialCoords[1]);
		c.lineTo(inviderRockets[i].currentCoords[0], 
			     inviderRockets[i].currentCoords[1]);
		c.closePath();
		c.stroke();
	}
}

function drawDefenderRockets() {
	c.strokeStyle = styleDR;
	c.lineWidth = lineDR;
	for (var i in defenderRockets) {
		c.beginPath();
		c.moveTo(launchers[defenderRockets[i].launcher].x, 
			     launchers[defenderRockets[i].launcher].y);
		c.lineTo(defenderRockets[i].currentCoords[0], 
			     defenderRockets[i].currentCoords[1]);
		c.closePath();
		c.stroke();
	}
}

function drawRocketExplosions() {
	c.fillStyle = styleDR;
	for (var i in rocketExplosions) {
		c.beginPath();
		c.arc(rocketExplosions[i].x0, rocketExplosions[i].y0, 
			  rocketExplosions[i].radius, 0, Math.PI * 2);
		c.closePath();
		c.fill();
	}
}

function drawCityExplosions() {
	c.fillStyle = styleIR;
	for (var i in cityExplosions) {
		c.beginPath();
		c.arc(cityExplosions[i].x0, cityExplosions[i].y0, 
			  cityExplosions[i].radius, 0, Math.PI * 2);
		c.closePath();
		c.fill();
	}
}

function checkInvider() {
top:
	for (var i in inviderRockets) {
		for (var j in cities) {
			if (cities[j].alive
			 && inviderRockets[i].currentCoords[0] > cities[j].x1 
			 && inviderRockets[i].currentCoords[0] < cities[j].x2
			 && inviderRockets[i].currentCoords[1] > cities[j].y1
			 && inviderRockets[i].currentCoords[1] < cities[j].y2) {
				cityExplosions.push(new CityExplosion(cities[j].x1));
				cities[j].alive = false;
				delete(inviderRockets[i]);
				if (checkEnd())
					break top;
				else
					break;
			}
		}
	}
}

function checkDefender() {
	var dist, x, y;
	for (var i in rocketExplosions) {
		for (var j in inviderRockets) {
			dist = (rocketExplosions[i].x0 - inviderRockets[j].currentCoords[0]) *
			       (rocketExplosions[i].x0 - inviderRockets[j].currentCoords[0]) +
			       (rocketExplosions[i].y0 - inviderRockets[j].currentCoords[1]) *
			       (rocketExplosions[i].y0 - inviderRockets[j].currentCoords[1]);
			dist = Math.sqrt(dist);
			if (dist <= rocketExplosions[i].radius) {
				x = inviderRockets[j].currentCoords[0];
				y = inviderRockets[j].currentCoords[1];
				rocketExplosions.push(new RocketExplosion(x, y));
				delete inviderRockets[j];
				scores++;
				document.getElementById("game-scores").innerHTML = scores;
			}
		}
	}
}

function checkEnd() {
	var alives = 0;
	for (var i in cities) {
		if (cities[i].alive) 
			alives++;
	}
	if (alives)
		return false;
	else {
		endGame();
		return true;
	}
}

function endGame() {
	clearInterval(mainGame);
	gameOn = false;
	c.fillStyle = "#ff0000";
	c.fillRect(0, 0, cWidth, cHeight);
	c.fillStyle = "#000";
	c.fillText("The End", 200, 280);
	buttonStart.style.display = "inline";
}

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var coords = [x, y];
    return coords;
}

/*------------------------ classes --------------------*/

function InviderRocket () {
	this.initialCoords = [Math.random() * cWidth, 0],
	this.currentCoords = [],
	this.currentCoords[0] = this.initialCoords[0],
	this.currentCoords[1] = this.initialCoords[1],
	this.direction = Math.random() * Math.PI/2 + Math.PI/4,
	this.dx = iSpeed * Math.cos(this.direction),
	this.dy = iSpeed * Math.sin(this.direction)
}

function DefenderRocket (pos) {
	var direction;
	if (pos[0] <= 233)
		this.launcher = 0;
	else if (pos[0] <= 466)
		this.launcher = 1;
	else
		this.launcher = 2;
	direction = Math.sqrt((pos[0] - launchers[this.launcher].x) * 
		        (pos[0] - launchers[this.launcher].x) + 
		        (pos[1] - launchers[this.launcher].y) *
		        (pos[1] - launchers[this.launcher].y));
	this.dx = dSpeed * (pos[0] - launchers[this.launcher].x) / 
	          direction;
	this.dy = dSpeed * (pos[1] - launchers[this.launcher].y) /
			  direction;
	this.currentCoords = [];
	this.currentCoords[0] = launchers[this.launcher].x;
	this.currentCoords[1] = launchers[this.launcher].y;
	this.goal0 = pos[0];
	this.goal1 = pos[1];
}

function Launcher(num) {
	this.x = 10 + 325 * num + 32,
	this.y = cHeight - 32
}

function RocketExplosion(x0, y0) {
	this.x0 = x0;
	this.y0 = y0;
	this.radius = 0;
}

function City(x, y) {
	this.x1 = x;
	this.x2 = x + 32;
	this.y1 = y;
	this.y2 = y + 32;
	this.alive = true;
}

function CityExplosion(xx) {
	this.x0 = xx + 16,
	this.y0 = cHeight - 16,
	this.radius = 0
}

