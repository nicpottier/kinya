var currIdx = 0;
var curr;
var retry = false;
var failed = false
var onEnter = submitQuiz;

var NUM = 5

var lessons = [ { "name": "Greetings", "pk": 1, "enabled": true, "questions": [ { "q": "Hello", "a": "Muraho", "n": "when you haven't seen someone for a few days", "pk": 1, "s": 0, "m": 0, "dq": 0 } , { "q": "How are you?", "a": "Amakuru?", "n": "", "pk": 2, "s": 0, "m": 0, "dq": 0 } , { "q": "I'm fine", "a": "Ni meza", "n": "response to how are you", "pk": 3, "s": 0, "m": 0, "dq": 0 } , { "q": "How are things?", "a": "Bite?", "n": "", "pk": 4, "s": 0, "m": 0, "dq": 0 } , { "q": "Things are good", "a": "Ni Byiza", "n": "response to how are things", "pk": 5, "s": 0, "m": 0, "dq": 0 } , { "q": "Welcome", "a": "Murakaza neza", "n": "as a greeting", "pk": 6, "s": 0, "m": 0, "dq": 0 } , { "q": "Good Morning", "a": "Mwaramutse", "n": "", "pk": 7, "s": 0, "m": 0, "dq": 0 } , { "q": "Good Afternoon", "a": "Mwiriwe", "n": "", "pk": 8, "s": 0, "m": 0, "dq": 0 } , { "q": "Goodbye", "a": "Mwirirwe", "n": "in the afternoon", "pk": 9, "s": 0, "m": 0, "dq": 0 } , { "q": "Good Night", "a": "Muramuke", "n": "", "pk": 10, "s": 0, "m": 0, "dq": 0 } , { "q": "Goodbye", "a": "Murabeho", "n": "when saying goodbye for a few days", "pk": 11, "s": 0, "m": 0, "dq": 0 } , { "q": "See you tomorrow", "a": "Nahejo", "n": "", "pk": 12, "s": 0, "m": 0, "dq": 0 } ] } ];

// our queues represent our mastery of questions.  When we get the right
// answer for a question on the first try, then we move from our current
// queue to the next queue.   When we miss a question
// the question moves to the next worse queue.
//
// Each queue is half as likely to be picked for a question as the queue
// before it.

// which queue we add an item from is determined from picking a random
// number from 1-15 inclusive, according to the patterns below
var dqs = [
    [], // q0 - the worst   16-8 .. 8,9,10,11,12,13,14,15
    [], // q1 -              8-4 .. 4,5,6,7
    [], // q2 -              4-1 .. 2,3
    []  // q3 - the best         .. 1
];

var questions = []

function playAudio(audio){
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', '/static/' + audio);
  audioElement.play();
  $(audio).remove();
}

function getNextQuestion(){
    random = Math.random();
    var item;

    level1 = dqs[0].length * 8
    level2 = dqs[1].length * 4
    level3 = dqs[2].length * 2
    level4 = dqs[3].length * 1

    total = level1 + level2 + level3 + level4

    var pick = Math.floor(total * 10)

    q = 0;
    if (pick <= 6){
        q = 0;
    } else {
        q = 2;
    }

//    if (pick <= level1){
//	q = 0;
//    } else if (pick <= level1 + level2){
//	q = 1;
//    } else if (pick <= level1 + level2 + level3){
//	q = 2;
//    } else {
//	q = 3;
//    }

    // first walk into items which need more practice
    do {
	if (dqs[q].length > 0){
	    item = dqs[q].shift();
	    break;
	}
	q--;
    } while (q >= 0);

    // still no item?  find the item that needs the most practice
    if (!item){
	for(q=0; q<4; q++){
	    if (dqs[q].length > 0){
		item = dqs[q].shift();
		break;
	    }
	}
    }

    if (item){
	item.m = 0
	item.active = true
    }
    return item;
}

function replaceCurrent(newItem){
    var oldItem = curr;

    // set the time for when we last saw our old item
    oldItem.last = Date.UTC()

    // put it in the right queue
    dqs[oldItem.dq].push(oldItem);

    var newItem = newItem;
    $(".q_" + curr.pk).fadeTo(500, .001, function(){
	if (oldItem){
	    $(this).removeClass("q_" + oldItem.pk)
	}
	$(this).addClass("q_" + newItem.pk)
	$(this).html("<div class='strike'></div>" + newItem.q)
	$(this).fadeTo(500, 1)
    });
    questions[currIdx] = newItem
}

function setCurrent(newCurr){
    curr = newCurr;

    if (!newCurr){
	// set our current question's text
	$("#quiz_question").text("");
	$("#quiz_note").text("");
    
	// clear our answer
	$("#quiz_answer").val("");
    
	// and correction
	$("#quiz_correction").removeClass("right")
	$("#quiz_correction").removeClass("wrong")
	$("#quiz_correction").hide()

	// update our queues
	displayQueues();

	return;
    }
    
    // remove current class
    $(".upcoming_current").removeClass("upcoming_current");
    
    // and set it to the current
    $(".q_" + curr.pk).addClass("upcoming_current");
    
    // set our current question's text
    $("#quiz_question").text(curr.q);
    $("#quiz_note").text(curr.n);
    
    // clear our answer
    $("#quiz_answer").val("");
    
    // and correction
    $("#quiz_correction").removeClass("right")
    $("#quiz_correction").removeClass("wrong")
    $("#quiz_correction").hide()
    
    // select the text box
    $("#quiz_answer").focus();

    // wire ourselves to always return to the text box as focus
    $("#quiz_answer").blur(function(){
	$("#quiz_answer").focus();
    });

    displayQueues();
 }

function checkAnswer(answer){
    var wasRight = false;
    if ($.browser.msie){
	var truth = curr.t.toLowerCase().replace(/[^a-z ]/g, '');
	var answer = answer.toLowerCase().replace(/[^a-z ]/g, '');
	wasRight = answer == truth;
    } else {
	var truth = curr.t.trim().toLowerCase().replace(/[^a-z ]/g, '');
	var answer = answer.trim().toLowerCase().replace(/[^a-z ]/g, '');
	wasRight = answer == truth;
    }

    // adjust the difficulty for the item
    if (!wasRight && curr.dq > 0){
	curr.dq--;
    } else if (curr.m == 0 && curr.dq < 3){
	curr.dq++;
    }

    if (wasRight){
        playAudio(curr.aud);

	$("#quiz_right").fadeTo(50, .2, function(){
	    $(this).fadeTo(100, .001);
	});
	
	if (!failed){
	    if (curr.s > 0){
		curr.s--;
	    } else {
		newItem = getNextQuestion()
		if (newItem != null){
		    replaceCurrent(newItem);
		} else {
		    curr.m = 0;
		    displayQueues();
		}
	    }
	}
    } else {
	$("#quiz_wrong").fadeTo(50, .2, function(){
	    $(this).fadeTo(100, .001);
	});

	curr.m++;
	if (curr.s <= 4 && !failed){
	    curr.s++;
	}
    }

    if (curr.s > 0){
	$(".q_" + curr.pk + "> .strike").html("<img src='/static/s" + curr.s + ".png'>");
    } else {
	$(".q_" + curr.pk + "> .strike").html("");
    }
    
    return wasRight;
}

function onLessonClick(){
    if ($(this).hasClass("lesson_selected")){
	$(this).removeClass("lesson_selected");
    } else {
	$(this).addClass("lesson_selected");
    }
    lesson = $(this).data('lesson');
    lesson.enabled = !lesson.enabled;
    initQuestions();
}

function nextQuestion(){
    currIdx = (currIdx+1) % questions.length;
    setCurrent(questions[currIdx])
    onEnter = submitQuiz;

    if ($.browser.webkit){
	$("#quiz_answer").attr("disabled", "")
    }
}

function retryQuestion(){
    setCurrent(curr)
    $("#quiz_answer").attr("disabled", "")
    $("#quiz_answer").focus();
    onEnter = submitQuiz;
}

function submitQuiz(){
    try{
	retry = !checkAnswer($("#quiz_answer").val());

	if (!retry){
	    $("#quiz_right_answer").text(curr.a);
	    $("#quiz_correction").removeClass("wrong")
	    $("#quiz_correction").addClass("right")
     	    $("#quiz_correction").show();
	    if ($.browser.webkit){
		$("#quiz_answer").attr("disabled", "disabled")
	    }
	    failed = false;
            onEnter = nextQuestion;
	} else {
	    $("#quiz_right_answer").text(curr.a);
	    $("#quiz_correction").removeClass("right")
	    $("#quiz_correction").addClass("wrong")
     	    $("#quiz_correction").show();
	    if ($.browser.webkit){
		$("#quiz_answer").attr("disabled", "disabled")
	    }
	    failed = true;
            onEnter = retryQuestion;
	}

	displayQueues();
    } catch (e){
	alert("fail: " + e.message)
    }

    return false;
}

function displayQueues(){
    for(i=0; i<4; i++){
	$("#dq" + i).html("");

	// add any current items
	for(j in questions){
	    if (questions[j].dq == i){
		$("#dq" + i).append("<div>" + questions[j].q + "</div>");
	    }
	}

	for(j in dqs[i]){
	    $("#dq" + i).append("<div>" + dqs[i][j].q + "</div>");
	}
    }
}

function initQuestions(){
    // clear everything out
    $("#lessons").empty();
    $("#upcoming").empty();

    // truncate our questions, we'll rebuild them
    questions.length = 0;

    // reset our difficulty qs, they'll get rebuilt too
    dqs = [ [],	[], [], [] ]

    // add in our lessons, while also building our list of questions
    for(i in lessons){
	lesson = lessons[i];

	selected = lesson.enabled ? " lesson_selected " : "";

	$("#lessons").append("<div class='lesson l_" + lesson.pk + selected + "'>" + 
			     lesson.name + "</div>");
	$('.l_' + lesson.pk).data('lesson', lesson);

	if (lesson.enabled){
	    for (j in lesson.questions){
		question = lesson.questions[j];
		question.lesson = lesson;
		question.active = false;
		
		dqs[question.dq].push(question);
	    }
	}
    }

    // sort our qs by last seen
    for (i in dqs){
        shuffle(dqs[i]);
    }

    // hook in our lesson click event
    $(".lesson").click(onLessonClick);

    // add in our questions
    for(i=0; i<NUM; i++){
	var q = getNextQuestion()
	if (!q){
	    break;
	}
	questions.push(q);
    }

    // build our list of questions from our lessons
    for (i in questions){
	$("#upcoming").append("<div class='question q_" + questions[i].pk + 
			      "'><div class='strike'></div>" + questions[i].q + "</div>");
    }

    currIdx = 0;
    setCurrent(questions[currIdx]);
}

$(document).ready(function(){
    $.ajaxSetup({
	"error": function(XMLHttpRequest,textStatus, errorThrown) { 
	    $('#error').html('Error' + textStatus + ' ' + errorThrown);
	} });

    $.getJSON('/ajax/get_lessons', function(data){
	lessons = data;
	initQuestions();
	$("#quiz").submit(function(){ return false; });
	$(document).keydown(function(e){
	    if (e.which == 13){
                onEnter()
		return true;
	    } else if (e.which == 32 && onEnter != submitQuiz){
                playAudio(curr.aud);
            }
	});
    });
 });

//shuffles list in-place
function shuffle(list) {
  var i, j, t;
  for (i = 1; i < list.length; i++) {
    j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
    if (j != i) {
      t = list[i];                        // swap list[i] and list[j]
      list[i] = list[j];
      list[j] = t;
    }
  }
}


