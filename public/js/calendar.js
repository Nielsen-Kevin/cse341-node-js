// Calendar App

function startCalendar() {
	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
	const daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const abbrDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

	// Master Objects
	var mContainer = document.getElementById('calendar');
	var mSchedule = {};
	var mHolidays = {};

	var today = new Date();
	// What calendar month to use
	if(window.location.hash) {
		arr = String(window.location.hash).substr(1).split('_',2);
		var d = new Date(arr[0], arr[1]-1, 1);// first day of the month
	} else {
		var d = new Date(today.getFullYear(), today.getMonth(), 1);// first day of the month
	}

	var numYear = d.getFullYear();// 4 digits
	var numMonthKey = d.getMonth();// month (from 0 to 11)
	var numMonth = d.getMonth() + 1;// month true number
	var txtMonth = monthNames[d.getMonth()];
	
	var totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
	var firstWeekDay = d.getDay();// day of week, from 0 (Sunday) to 6 (Saturday)

	var calendar = {};
	var eventCount = 0;
	var holidayCount = 0;

	var modal;
	var loadModal;
	var tasksLoading = 0;

	var loglock = loginRequired();

	function buildCalendarArray(year, month) {
	
		var CalendarDate = {
			key: '',
			day: '',
			month: month,
			year: year,
			weekDay: '',
			holiday: '',
			today: false,
			// Methods
			button: function() {
				createModal('Add Event');
				addEvent(this.year + '-' + ('0' + this.month).slice(-2) + '-' + ('0' + this.day).slice(-2));
			},
			createDayPlaceIn: function(obj) {
				let thisDay = document.createElement('div');
				thisDay.setAttribute('id', this.key);
				thisDay.setAttribute('class', 'day');
				// Is it today
				if(calendar[this.key].year == today.getFullYear() && calendar[this.key].month == today.getMonth()+1 && calendar[this.key].day == today.getDate()) {
					thisDay.classList.add('today');
					this.today = true;
				}

				// Create on click
				thisDay.onclick = function() {
					calendar[this.id].button();
				};
				obj.appendChild(thisDay);
				// Add Label
				let dayLabel = document.createElement('label');
				dayLabel.innerHTML = calendar[this.key].day;
				thisDay.appendChild(dayLabel);
			}
		}

		for(let day = 1; day <= totalDays; day++) {
			obj = new Date(year, month - 1, day);
			dateKey = obj.getFullYear() + '_' + ('0' + month).slice(-2) + '_' + ('0' + obj.getDate()).slice(-2);
			// Object Creation Functions
			calendar[dateKey] = Object.create(CalendarDate);
			calendar[dateKey].key = dateKey;
			calendar[dateKey].day = day;
			calendar[dateKey].weekDay = daysInWeek[obj.getDay()];
		}
	}

	// Instantiation with Inheritance Properties and Methods
	var DateObject = function(key, type, name, day, month, year, time=false, color=false, recordId=false) {
		this.type = type;
		this.name = name;
		this.color = color;
		this.day = day;
		this.month = month;
		this.year = year;
		this.time = time;
		this.recordId = recordId;
		// Methods
		this.id = function() {
			return this.year + '_' + ('0' + this.month).slice(-2) + '_' + ('0' + this.day).slice(-2);
		}
		this.updateDay = function() {
			if(this.month == numMonth) {
				let goWhere = document.getElementById(this.id())
				let dayObject = document.createElement('div'); 
				dayObject.innerHTML = this.name;
				dayObject.setAttribute('id', key);
				dayObject.classList.add(this.type);
				if(this.color) {
					dayObject.style.backgroundColor = this.color;
				}
				goWhere.appendChild(dayObject);
				
				// Create on click
				if(this.type == 'event') {
					dayObject.onclick = function(event) {
						event.stopPropagation();// Stop day div from being clicked too
						createModal('Edit Event');
						editEvent(key, name, year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2), time, color);
					};
				}
			}
		}
	}

	var NewHoliday = function(name, month, day) {
		let key = 'h' + holidayCount;
		mHolidays[key] = new DateObject(key, 'holiday', name, day, month, numYear);
		holidayCount++;
		return key;
	}

	var NewEvent = function(name, month, day, year, time, color) {
		if(name) {
			let key = 'e' + eventCount;
			let record = new DateObject(key, 'event', name, day, month, year, time, color);
			if(numYear == year && numMonth == month) {
				//Attach object
				mSchedule[key] = record;
				// Auto Save
				let params = setupParams(name, month, day, year, time, color);
				if( saveRecord(key, params) ) {

					let currentDataKey = 'e' + numYear + ('0' + numMonth).slice(-2);
					let monthKey = 'e' + year + ('0' + month).slice(-2);
					if(currentDataKey != monthKey) {
						// Moving to new month remove
						if(mSchedule[key]) {
							delete mSchedule[key];
						}
					}
				}
				mSchedule[key].updateDay();
				autoIncrement();
			}
		}
	}

	var UpdateEvent = function(key, name, month, day, year, time, color) {
		let recordId = mSchedule[key].recordId;
		let record = new DateObject(key, 'event', name, day, month, year, time, color, recordId);

		if(numYear == year && numMonth == month) {
			//Attach object
			mSchedule[key] = record;
			// Auto save
			let params = setupParams(name, month, day, year, time, color);
			if( updateRecord(key, params) ) {

				let currentDataKey = 'e' + numYear + ('0' + numMonth).slice(-2);
				let monthKey = 'e' + year + ('0' + month).slice(-2);
				if(currentDataKey != monthKey) {
					// Moving to new month remove
					if(mSchedule[eventKey]) {
						delete mSchedule[eventKey];
					}
				}
			}
			alert('updateDay');
			mSchedule[key].updateDay();

			obj = document.getElementById(key);
			if (obj.parentNode) {
				obj.parentNode.removeChild(obj);
			}
		}
	}

	// My Modal
	function createModal(title='') {
		// Create modal
		modal = document.createElement('div');
		modal.setAttribute('id', 'modal');

		html = `<div class="modal-content">
			<span class="close">&times;</span>
			<div class="title">${title}</div>
			<input type="hidden" name="id" value="">
			<p><label for="event">Event</label> <input type="text" name="event"></p>
			<p><label for="date">Date</label> <input type="date" name="date"></p>
			<p><label for="time">Time</label> <input type="time" name="time"></p>
			<p><label for="color">Color</label> <input type="color" name="color" list="colorlist"></p>
			<datalist id="colorlist">`;
			for(let c of ['#ffff80','#80ff80','#80ffff','#b8a9c9','#ff8080','#ffcc5c','#96ceb4','#d9ad7c','#b7d7e8','#c0c0c0']) {
				html += `<option value="${c}"></option>`;
			}
			html += `</datalist>
			<p><input type="button" name="delete" value="Delete" class="button"> <input type="button" name="save" value="Save" class="button"></p>
			<div id="events"></div>
		</div>`;

		modal.innerHTML = html;
		document.body.appendChild(modal);

		// click on x close the modal
		document.getElementsByClassName('close')[0].onclick = function() {
			modal.end();
		}
		// click anywhere outside of the modal close it
		window.onclick = function(event) {
			if (event.target == modal) {
				modal.end();
			}
		}

		//Start fade-in grow
		modal.classList.add('fadeGrow');
		setTimeout(function() {
			modal.classList.remove('fadeGrow');
		}, 1);

		modal.end = function() {
			modal.classList.add('fadeGrow');
			setTimeout(function() {
				modal.style.display = 'none';
				modal.remove();
			}, 500);
		}
	}

	function addEvent(date) {
		// Update Field
		document.getElementsByName('date')[0].value = date;
		document.getElementsByName('time')[0].value = today.getHours() + Math.round(today.getMinutes()/60) + ':00';
		document.getElementsByName('color')[0].value = '#ffff80';
		document.getElementsByName('delete')[0].style.display = 'none';
		onSameDay(date.slice(-2), false);
		// Save button
		document.getElementsByName('save')[0].onclick = function() {
			// Get input data
			let nEvent = document.getElementsByName('event')[0].value;
			let nDate = document.getElementsByName('date')[0].value.split('-');
			let nTime = document.getElementsByName('time')[0].value;
			let nColor = document.getElementsByName('color')[0].value;
			// Save data
			NewEvent(nEvent, nDate[1], nDate[2], nDate[0], nTime, nColor);
			modal.end();
		}
	}

	function editEvent(id, name, date, time, color) {
		// Update Fields
		document.getElementsByName('id')[0].value = id;
		document.getElementsByName('event')[0].value = name;
		document.getElementsByName('date')[0].value = date;
		document.getElementsByName('time')[0].value = time;
		document.getElementsByName('color')[0].value = color;
		document.getElementsByClassName('title')[0].innerHTML = 'Edit Event';
		document.getElementsByName('delete')[0].style.display = '';
		onSameDay(date.slice(-2), id);
		// Save button
		document.getElementsByName('save')[0].onclick = function() {
			// Get input data
			let id = document.getElementsByName('id')[0].value;
			let nEvent = document.getElementsByName('event')[0].value;
			let nDate = document.getElementsByName('date')[0].value.split('-');
			let nTime = document.getElementsByName('time')[0].value;
			let nColor = document.getElementsByName('color')[0].value;
			// Save data
			UpdateEvent(id, nEvent, nDate[1], nDate[2], nDate[0], nTime, nColor);
			modal.end();
		};
		// Delete button
		document.getElementsByName('delete')[0].onclick = function() {
			// Delete data
			if(deleteEvent(id)) {
				document.getElementById(id).remove();
			}
			modal.end();
		};
	}

	function onSameDay(day, id) {
		let dayList = [];
		// Filter out events
		for(let key in mSchedule) {
			if(mSchedule[key].day == day) {
				if(key != id) {
					mSchedule[key].key = key;
					dayList.push(mSchedule[key]);
				}
			}
		}
		// Filter out holidays
		for(let key in mHolidays) {
			if(mHolidays[key].day == day) {
				dayList.push(mHolidays[key]);
			}
		}
		if(dayList.length >= 1) {
			document.getElementById('events').innerHTML = '<br><div><b>Other Events on ' + monthNames[dayList[0].month-1] + ' ' + day + '</b></div>';
			for(let key in dayList) {
				div = document.createElement('div');
				div.innerHTML = dayList[key].name;
				div.setAttribute('data-id', dayList[key].key);
				div.classList.add(dayList[key].type);
				if(dayList[key].color) {
					div.style.backgroundColor = dayList[key].color;
				}
				if(dayList[key].type == 'event') {
					div.onclick = function(event) {
						document.getElementById('events').innerHTML = '';
						// Swap events
						editEvent(dayList[key].key, dayList[key].name, dayList[key].year + '-' + ('0' + dayList[key].month).slice(-2) + '-' + ('0' + dayList[key].day).slice(-2), dayList[key].time, dayList[key].color);
					};
				}
				document.getElementById('events').append(div);
			}
		}
	}

	// Loading Manager
	function addLoading() {
		if(tasksLoading == 0) {
			// Create loading modal
			loadModal = document.createElement('div');
			loadModal.setAttribute('id', 'loading');
			loadModal.innerHTML = '<div id="loader">Loading...</div>';
			document.body.appendChild(loadModal);
		}
		tasksLoading += 1;
	}

	function endLoading() {
		tasksLoading -= 1;
		if(tasksLoading == 0) {
			loadModal.remove();
		}
	}

	buildCalendarArray(numYear,numMonth);

	// Create Month Title
	let monthHeading = document.createElement('div');
	monthHeading.setAttribute('id', 'monthHeader');
	monthHeading.innerHTML = '<h2>' + txtMonth + ' ' + numYear + '</h2>';
	mContainer.appendChild(monthHeading);

	// Add buttons for previous and next months
	function prev() {
		let setPrev = new Date(numYear, numMonthKey - 1, 1);
		window.location.hash = setPrev.getFullYear() + '_' + (setPrev.getMonth() + 1);

		// Move calendar grid to left
		document.querySelector('.grid').classList.add('moveLeft');

		// Give time for the transitions and animations to run
		setTimeout(function() {
			mContainer.innerHTML = '';
			startCalendar();
		}, 500);
	}

	function next() {
		let setNext = new Date(numYear, numMonthKey + 1, 1);
		window.location.hash = setNext.getFullYear() + '_' + (setNext.getMonth() + 1);
		
		// Move calendar grid to right
		document.querySelector('.grid').classList.add('moveRight');

		// Give time for the transitions and animations to run
		setTimeout(function() {
			mContainer.innerHTML = '';
			startCalendar();
		}, 500);
	}

	// Create Prev Button
	let btnPrev = document.createElement('span'); 
	btnPrev.addEventListener('click', function(event) {
		prev();
	});
	btnPrev.innerHTML = '<';
	btnPrev.classList.add('prev');
	monthHeading.insertBefore(btnPrev, monthHeading.childNodes[0]);

	// Create Next Button
	let btnNext = document.createElement('span'); 
	btnNext.addEventListener('click', function(event) {
		next();
	});
	btnNext.innerHTML = '>';
	btnNext.classList.add('next');
	monthHeading.appendChild(btnNext);

	// Create calendar grid of days
	let grid = document.createElement('div');
	grid.setAttribute('class', 'grid');
	mContainer.appendChild(grid);

	// Create Days of week
	for(let key in daysInWeek) {
		let weekDay = document.createElement('div');
		weekDay.setAttribute('id', daysInWeek[key]);
		weekDay.setAttribute('class', 'weekday');
		weekDay.setAttribute('data-abbr', abbrDays[key]);
		weekDay.innerHTML = daysInWeek[key];
		grid.appendChild(weekDay);
	}

	// Build off set - placeholders to help set starting day on corret day of the week
	for(let i=1; i<=firstWeekDay; i++) {
		let offset = document.createElement('div');
		offset.setAttribute('class', 'offset');
		grid.appendChild(offset);
	}

	// Build Calendar's days
	for(let key in calendar) {
		calendar[key].createDayPlaceIn(grid);
	}

	// Request Holidays from API for given month
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			endLoading();
			
			let holidays = JSON.parse(this.responseText);
			for(let key in holidays) {
				let id = NewHoliday(holidays[key].name, parseInt(holidays[key].month, 10), parseInt(holidays[key].day, 10));
				mHolidays[id].updateDay();
			}
		}
		if (this.readyState == 1) {
			addLoading();
		}
	};
	xhttp.open('GET', '/holidayAPI/year/' + numYear + '/month/' + numMonth, true);
	xhttp.send();

	function autoIncrement() {
		eventCount++;
		//console.log('eventCount', eventCount);
	}
	getMonthRecords();

	// Retrieve list of events and parse them back into an array
	function getMonthRecords() {
		// AJAX Get Month Records
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				endLoading();
				
				let events = JSON.parse(this.responseText);

				for(let k in events) {
					let key = 'e' + eventCount;
					let record = new DateObject(key, 'event', events[k].name, parseInt(events[k].day, 10), numMonth, numYear, events[k].time, events[k].color, events[k].id);
					mSchedule[key] = record;
					mSchedule[key].updateDay();
					autoIncrement();
				}
			}
			if (this.status == 500) {
				endLoading();
			}
			if (this.readyState == 1) {
				addLoading();
			}
		};
		xhttp.open('GET', '/event/' + numYear + '/' + numMonth, true);
		xhttp.send();
	}

	function setupParams(name, month, day, year, time, color) {
		day = ('0' + day).slice(-2);
		month = ('0' + month).slice(-2);
		year = year;
		time = (time) ? time + ':00' : '00:00:00';
		return params = {
			name: name,
			date: `${year}-${month}-${day} ${time}`,
			color: color
		}
	}

	// Save records every time there is a change
	function saveRecord(eventKey, params) {
		// AJAX SAVE
		$.post("/event", params, function(result) {
			if (result && result.success) {
				// handle success
				console.log(result);
				mSchedule[eventKey].recordId = result.id;
				return true;
			} else {
				// handle failure
				console.log('ajax error:', error);
				return false;
			}
		});
	}

	// Update records every time there is a change
	function updateRecord(eventKey, params) {
		let id = mSchedule[eventKey].recordId;
		console.log('Updating id:', id);
		let status = false;

		if(id) {
			// AJAX UPDATE
			$.ajax({
				url: '/event/' + id,
				method: 'PUT',
				data: params,
				success: function(result) {
					// handle success
					if (result && result.success) {
						console.log(result);
						status = true;
					}
				},
				error: function(request,msg,error) {
					// handle failure
					console.log('ajax error:', error);
				}
			});
		} else {
			console.log('error no id');
		}
		return status;
	}

	// Remove Event
	function deleteEvent(eventKey) {
		let id = mSchedule[eventKey].recordId;
		console.log('Deleting id:', id);
		let status = false;

		if(id) {
			// AJAX DELETE
			$.ajax({
				url: '/event/' + id,
				method: 'DELETE',
				contentType: 'application/json',
				success: function(result) {
					// handle success
					if (result && result.success) {
						// Remove event object
						delete mSchedule[eventKey];
						status = true;
					}
				},
				error: function(request,msg,error) {
					// handle failure
					console.log('ajax error:', error);
				}
			});
		}
		return status;
	}

///////////////////////////////////////////////////////////////////////
	
	// Check server logged in
	function loginRequired() {
		$.get("/event/access", function(result) {
			if (result && result.success) {
				// handle success
				console.log(result);
				return true;
			} else {
				// Login modal
				loginForm();
				return false;
			}
		});
	}

	// Login Modal Form
	function loginForm() {
		// Create modal
		modal = document.createElement('div');
		modal.setAttribute('id', 'modal');

		html = `<div class="modal-content">
			<div class="title">Login</div>
			<div class="container">
				<div class="row">
					<div class="col-sm-6">
						<label for="username">Username</label>
						<input type="text" id="username" placeholder="username" class="form-control"><br>
						<label for="password">Password</label>
						<input type="password" id="password" placeholder="password" class="form-control"><br>
						<button class="btn btn-primary" id="login">Log in</button>
						<br>
						<div id="status"></div>
					</div>
				</div>
			</div>
		</div>`;

		modal.innerHTML = html;
		document.body.appendChild(modal);

		document.getElementById('login').onclick = function() {
			login();
		}

		//Start fade-in grow
		modal.classList.add('fadeGrow');
		setTimeout(function() {
			modal.classList.remove('fadeGrow');
		}, 1);

		modal.end = function() {
			modal.classList.add('fadeGrow');
			setTimeout(function() {
				modal.style.display = 'none';
				modal.remove();
			}, 500);
		}
	}

	function login() {
		var params = {
			username: $("#username").val(),
			password: $("#password").val()
		};
	
		$.post("/account/login", params, function(result) {
			if (result && result.success) {
				$("#status").text("Successfully logged in.");
				modal.end();
				return true;
			} else {
				$("#status").text("Error logging in.");
				return false;
			}
		});
	}

}// end app