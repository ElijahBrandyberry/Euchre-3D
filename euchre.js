var face_type = ['9','10','Jack','Queen','King','Ace'],
    trump_face_type = ['9','10','Queen','King','Ace','Jack2','Jack'], 
    suit = ['Clubs','Diamonds','Spades','Hearts'],
    suits = [['Clubs', 'Spades'], ['Diamonds','Hearts']],
    color = [0,1],
    turn = 2,
    round = 0,
    dealer = 2,
    kitty_card = "",
    used = [],
    pickup = false,
    trump = {},
    cards_played = 0,
    played = {},
    hand = 1,
    tricks = [0, 0],
    high_card = null,
    called = {};
    players = ['Abel', 'Brad', 'Christian', 'David']
function setup () {
  create_card(4, '.card-holder');
  create_card(5,$('#player_1'), 1);
  create_card(5,$('#player_2'), 2);
  create_card(5,$('#player_3'), 3);
  create_card(5,$('#player_4'), 4);
  rotate_table(0)
  $('.control-button').hide()
  show_turn_start();
  if (round > 1 || trump.suit) {
    $('.card-holder').hide()
    $('.kitty_card').removeClass('clickable')
  };
  next_turn(turn - 1)
  $('.dealer').prependTo('#player_'+dealer)
  $('#dealer').text(players[dealer-1])
}

function create_card (num, elem, player_num) {

  for (var i = 0; i < num; i++) {
    var card = document.createElement("div");
    card.className = "card ";
    var front = document.createElement("figure");
    front.className = "front";
    var back = document.createElement("figure");
    back.className = "back";
    if (elem == '.card-holder') {
      if (i == num-1) {
        card.className += "clickable kitty_card ";
        $('.clickable').css({transform: 'rotateZ(90deg) translate3d(0px, 0px, '+i+'px)'})
      } else {
        card.style.transform = 'rotateZ(90deg) translate3d(0px, 0px, '+i+'px)'
      };
    };
    var no_class = true
    while (no_class) {
      random_suit = Math.floor((Math.random() * 4) + 1)
      random_card = 15 - Math.floor((Math.random() * 6) + 1)
      var position = (random_suit*160)-1.8+'px '+random_card*113.5+'px'
      var card_class = face_type[random_card-9]+suit[random_suit-1]
      if (jQuery.inArray(card_class, used) == -1) {
        back.style.backgroundPosition = position
        card.className += card_class+" ";
        card.dataset.suit = suit[random_suit-1]
        card.dataset.type = face_type[random_card-9]
        if (player_num) {
          card.dataset.player = player_num
        };
        if (card.dataset.suit == "Clubs" || card.dataset.suit == "Spades") {
          card.dataset.color = color[0]
        } else {
          card.dataset.color = color[1]
        };
        no_class = false
        used.push(card_class)
        if (elem == '.card-holder') {
          if (i == num-1) {
            $('#trump').html('Kitty card: <b class="c'+card.dataset.color+'">'+card.dataset.type+'</b> of <b class="c'+card.dataset.color+'">'+card.dataset.suit+'</b>')
          };
        }
      };
    }
    card.appendChild(front)
    card.appendChild(back)
    $(elem).append(card)
  };
}

function create_score_card (num, suit_num, elem) {
  for (var i = 0; i < num; i++) {
    var card = document.createElement("div");
    card.className = "card ";
    var front = document.createElement("figure");
    front.className = "front";
    var back = document.createElement("figure");
    back.className = "back";
    if (i == num-1) {
      card.className += "four "
      random_card = 4
    } else {
      card.className += "six "
      random_card = 6
    };
    var position = (suit_num*160)-3.5+'px '+random_card*113.5+'px'
    back.style.backgroundPosition = position
    var no_class = true
    card.appendChild(front)
    card.appendChild(back)
    $(elem).append(card)
  };
}

function get_high_card () {
  var card_list = []
  $('#show_cards_played .hand .card').each(function() {
    var card = $(this)
    card_type = card.attr('data-type')
    var value = 0;
    if (card.attr('data-suit') == trump.suit) {
      value = trump_face_type.indexOf(card_type) + 6
    } else {
      value = face_type.indexOf(card_type)
    };
    clss = card.attr('class')
    card_list.push({val: value, elem: card})
  });
  card_list.sort(function(a, b) {
    return parseFloat(a.val) - parseFloat(b.val);
  });
  card_list.reverse()
  if (card_list.length > 0) {
    high_card = card_list[0].elem
  };
}

function appendToPlayer () {
  get_high_card()
  var player = high_card.attr('data-player')/1;
  var team = player % 2;
  if (team == 0) {
    team = 2;
  };
  tricks[team-1] += 1;
  $('#t'+team).text(tricks[team-1])
  $('#high_card').text('The high card is the '+high_card.attr('data-type')+' of '+high_card.attr('data-suit')+' and was played by '+players[high_card.attr('data-player')/1-1]+' and has won the trick')
  $('#hand'+hand).appendTo('#player_'+team+'_trick')
  turn = player + 3;
  next_hand()
}

function next_hand () {
  hand += 1
  cards_played = 0
  played = {}
  $('#played').text('')
  high_card = null
  next_turn()
  if (hand > 5) {
    setTimeout(function() {
      show_winner()
    }, 1500);
  }
}

function show_winner () {
  if (tricks[0] > tricks[1]) {
    alert('Team 1 wins!')
  } else {
    alert('Team 2 wins!')
  }
}

function show_turn_start () {
  $('#turn_start').fadeIn(300)
  $('.turn').text(players[turn-1]+'\'s turn')
  elem = $('#hand'+hand).clone()
  elem.attr('id', '')
  elem.appendTo('#show_cards_played');
  get_high_card()
  if (high_card) {
    high_card.addClass('high_card')
    $('#high_card').text('The high card is the '+high_card.attr('data-type')+' of '+high_card.attr('data-suit')+' and was played by '+players[high_card.attr('data-player')/1-1])
  };
  if (cards_played == 4) {
    appendToPlayer()
  };
}

function hide_turn_start () {
  $('#turn_start').fadeOut(300)
  $('#player_'+turn+' .card').addClass('view-card')
  show_available_buttons()
  if (pickup) {
    $('.kitty_card').addClass('view-card')
  };
  $('#show_cards_played').children().remove();
}

function show_available_buttons () {
  if (!trump.suit) {
    if (round == 1) {
      $('.trump-button').show()
    } else if (round == 2) {
      $('.card-holder').hide()
      $('.kitty_card').removeClass('clickable')
      kitty_suit = kitty_card.attr('data-suit')
      $('.suit-button').show()
      $('#select'+kitty_suit).hide()
      if (turn == dealer) {
        $('#pass').hide()
      };
    };
  };
}

function rotate_table (x) {
  transform = -(((turn-1) * 90) + 180) + 360
  $('#view').css({transform: 'rotateY('+transform+'deg) translate3d(0px, 0px, 0px)'});
  if (dealer == 1) {
    translate = 'translate3d(0px, 0px, 0px)'
  } else if (dealer == 2) {
    translate = 'translate3d(-190px, -104px, 0px)'
  } else if (dealer == 3) {
    translate = 'translate3d(-85px, -247px, 0px)'
  } else if (dealer == 4) {
    translate = 'translate3d(100px, -185px, 0px)'
  };
  $('.card-holder').css({transform: 'rotateZ('+(-(dealer+3)*90)+'deg) '+translate})
}

function next_turn () {
  $('.player .card').removeClass('view-card')
  $('.control-button').hide()
  turn += 1;
  if (turn > 4) {
    rotate_table(0)
    turn -= 4
    setTimeout(function() {
      $('#view').removeClass('animate-all')
      rotate_table(0)
      setTimeout(function() {
        $('#view').addClass('animate-all')
      },200);
    }, 200);
  } else {
    rotate_table(0)
  };
  if (turn - 1 == dealer) {
    round += 1
  };
  show_turn_start()
}

function set_trump (trump_color, trump_suit, player) {
  trump = {color: trump_color, suit: trump_suit}
  var jack_suit = suits[trump.color][0]
  if (suits[trump_color].indexOf(trump_suit) == 0) {
    jack_suit = suits[trump.color][1]
  }
  $('.Jack'+jack_suit).attr('data-suit', trump_suit)
  $('.Jack'+jack_suit).attr('data-type', 'Jack2')
  $('#trump').text('Trump: '+trump_suit)
  var team = player % 2;
  called = {alone: false, team: team}
}

function drag_screen () {
  var drag = false;
  var mous_pos = 0;
  $('#perspective').on('mousedown',function(e){ 
    mous_pos = e.pageX
    drag = true;
  }); 
  $('#perspective').on('mouseup',function(e){ 
    if (drag) {
      $('#view').css({transform: 'rotateY('+(transform)+'deg) translate3d(0px, 0px, 0px)'});
      $('#view').addClass('animate')
      setTimeout(function() {
        $('#view').removeClass('animate')
      },300);
      temp = transform;
      drag = false;
    };
  }); 
  $('#perspective').on('mousemove',function(e){ 
    if (drag) {
      var x = -(mous_pos-e.pageX);
      temp = transform
      temp += x/10
      $('#view').css({transform: 'rotateY('+temp+'deg) translate3d(0px, 0px, 0px)'});
    };
  }); 
}

$(document).on('ready',function() {
  setup()
  kitty_card = $('.kitty_card')
  $('#hide_turn_start').click(function() {
    hide_turn_start()
  });

  $('#pass').click(function() {
    next_turn()
  });

  $(window).keydown(function(e) {
    var elem = "";
    if(e.which == 13) {
      if ($('#turn_start').css('display') !== 'none') {
        elem = '#hide_turn_start'
      } else if ($('#show_hand').css('display') !== 'none') {
        elem = '#close_show_hand'
      };
      $(elem).trigger('mousedown')
      $(elem).addClass('btn-mousedown')
    };
  });
  $(window).keyup(function(e) {
    var elem = "";
    if(e.which == 13) {
      if ($('#turn_start').css('display') !== 'none') {
        elem = '#hide_turn_start'
      } else if ($('#show_hand').css('display') !== 'none') {
        elem = '#close_show_hand'
      };
      $(elem).removeClass('btn-mousedown')
      setTimeout(function() {
        $(elem).click()
      }, 10);
    };
  });

  $('#pickup').click(function() {
    $('.kitty_card').click()
  });

  $('.suit-button:not(.trump-button)').click(function() {
    set_trump($(this).attr('data-color'), $(this).attr('data-suit'), turn)
    if (turn !== dealer + 1) {
      turn = dealer
      next_turn()
    };
  });

  $('.kitty_card').click(function() {
    card = $(this)
    set_trump(card.attr('data-color'), card.attr('data-suit'), turn)
    if (turn !== dealer) {
      turn = dealer - 1
      next_turn()
    };
    pickup = true
  });

  $('.player .card').click(function() {
    if ('player_'+turn == $(this).parent().attr('id')) {
      var card_holder = '#player_'+turn
      var card_elem = $(this)
      var card = {suit: card_elem.attr('data-suit'), color: card_elem.attr('data-color'), type: card_elem.attr('data-type'), player: card_elem.attr('data-player')}
      if (pickup) {
        pickup = false
        $('.kitty_card').appendTo(card_holder)
        $('.kitty_card').removeClass('clickable')
        $('.kitty_card').removeClass('kitty_card')
        card_elem.addClass('clickable')
        card_elem.appendTo('.card-holder')
        card_elem.removeClass('view-card')
        setTimeout(function() {
          $('.clickable').removeClass('clickable')
          next_turn()
          setTimeout(function() {
            $('.card-holder').hide()
          }, 200);
        }, 200);
      } else if (trump.suit) {
        if (cards_played == 0) {
          card_elem.appendTo('#hand'+hand)
          played = {suit: card.suit, color: card.color}
          $('#played').text('Played: '+card.suit)
          cards_played += 1
          next_turn()
        } else if (card.suit == played.suit || $('#player_'+turn+' .card[data-suit="'+played.suit+'"]').length == 0) {
          card_elem.appendTo('#hand'+hand)
          cards_played += 1
          next_turn()
        };
      };
    };
  });

  drag_screen()
});