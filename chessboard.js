var Chessboard = function(id, settings) {
    const SIDE = settings?.side || 'w'
    const CHESS = new Chess()
    const ALPHABET = 'abcdefgh'
    const IMG_PATH = './chesspieces/'
    const AUDIO_PATH = './audio/'
    const AUDIO = {
        capture: new Audio(AUDIO_PATH + 'capture.mp3'),
        move: new Audio(AUDIO_PATH + 'move.mp3'),
        error: new Audio(AUDIO_PATH + 'error.mp3'),
    }

    var BOARD_ELM = document.getElementById(id)
    var BOARD_BOX = BOARD_ELM.getBoundingClientRect()

    BOARD_ELM.drag = false
    BOARD_ELM.selected = null
    BOARD_ELM.from = null
    BOARD_ELM.to = null

    var removeHSquares = function() {
        for (var i = 0; i < 64; i++) {
            var clist = BOARD_ELM.childNodes[i].getElementsByClassName('highlight_div')[0].classList
            
            if (clist.contains('highlighted_1')) { clist.remove('highlighted_1') }
            if (clist.contains('highlighted_2')) { clist.remove('highlighted_2') }
            if (clist.contains('highlighted_3')) { clist.remove('highlighted_3') }

        }
    }

    var checkPosition = function() {
        var board = CHESS.board()

        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var square = BOARD_ELM.childNodes[j + 8 * i].id
                var piece = BOARD_ELM.childNodes[j + 8 * i].getElementsByClassName('piece')[0]

                var sq = CHESS.get(square)

                if (sq == null) {
                    if (piece != null) { piece.remove() }

                    continue
                }

                else if (piece == null) { 
                    var square_ = BOARD_ELM.childNodes[j + 8 * i]
                    // square_.appendChild(piece(sq)) Can't access f piece() for some reason :'(
                        
                    var p = document.createElement('img')
                    var width = parseInt(BOARD_ELM.style.width, 10) / 8
                    var height = parseInt(BOARD_ELM.style.height, 10) / 8
                    p.id = sq.color + sq.type
                    p.classList.add('piece')
                    p.src = IMG_PATH + sq.color + sq.type + '.png'
                    p.style.left = 0
                    p.style.top = 0
                    p.style.width = width + 'px'
                    p.style.height = height + 'px'
                    p.isSliding = false

                    square_.appendChild(p)
                }
            }
        }
    }

    var square = function(i, j) {
        var square = document.createElement('div')
        var width = parseInt(BOARD_ELM.style.width, 10) / 8
        var height = parseInt(BOARD_ELM.style.height, 10) / 8
        square.id = ALPHABET[(SIDE == 'w' ? j : 8 - j)] + (SIDE == 'w' ? 8 - i : i + 1)
        square.classList.add('square')
        square.classList.add((j + i) % 2 == 0 ? 'white' : 'black')
        square.style.width = width + 'px'
        square.style.height = height + 'px'
        square.style.marginTop = height * i + 'px'
        square.style.marginLeft = width * j + 'px'

        square.appendChild(hDiv())

        return square
    }

    var piece = function(p) {
        var piece = document.createElement('img')
        var width = parseInt(BOARD_ELM.style.width, 10) / 8
        var height = parseInt(BOARD_ELM.style.height, 10) / 8
        piece.id = p.color + p.type
        piece.classList.add('piece')
        piece.src = IMG_PATH + p.color + p.type + '.png'
        piece.style.left = 0
        piece.style.top = 0
        piece.style.width = width + 'px'
        piece.style.height = height + 'px'
        piece.isSliding = false

        return piece
    }

    var hDiv = function() {
        var hdiv = document.createElement('div')
        var width = parseInt(BOARD_ELM.style.width, 10) / 8
        var height = parseInt(BOARD_ELM.style.height, 10) / 8
        hdiv.className = 'highlight_div'
        hdiv.style.width = width + 'px'
        hdiv.style.height = height + 'px'

        return hdiv
    }

    var chessboard = {
        load: function() {
            var board = CHESS.board()

            for (var i = 0; i < board.length; i++) {
                for (var j = 0; j < board[i].length; j++) {

                    if (SIDE == 'b') { var sq = square(7 - i, 7 - j) }

                    else { var sq = square(i, j) }

                    BOARD_ELM.appendChild(sq)

                    if (board[i][j] == null) continue

                    var p = piece(board[i][j])

                    sq.appendChild(p)
                }
            }

            window.onmousedown = function(e) {
                if (!e.target.classList.contains('piece')) return

                if (e.target.isSliding) return

                BOARD_ELM.drag = true
                BOARD_ELM.selected = e.target
                BOARD_ELM.from = e.target.parentElement.id
                e.target.style.zIndex = 2

                var moves = CHESS.moves({ square: e.target.parentNode.id, verbose: true })
                
                removeHSquares()

                for (var i = 0; i < moves.length; i++) {
                    var to_square = document.getElementById(moves[i].to)
                    var from_square = document.getElementById(moves[i].from)

                    to_square.getElementsByClassName('highlight_div')[0].classList.add('highlighted_1')
                    
                    if (from_square.getElementsByClassName('highlight_div')[0].classList.contains('highlighted_1')) continue

                    from_square.getElementsByClassName('highlight_div')[0].classList.add('highlighted_1')
                }

                
            }

            window.onmousemove = function(e) {
                if (BOARD_ELM.selected == null || !BOARD_ELM.drag) return

                BOARD_ELM.selected.style.left = e.clientX - BOARD_ELM.selected.width / 2 - BOARD_BOX.x - parseInt(BOARD_ELM.selected.parentElement.style.marginLeft) + 'px'
                BOARD_ELM.selected.style.top = e.clientY - BOARD_ELM.selected.height / 2 - BOARD_BOX.y - parseInt(BOARD_ELM.selected.parentElement.style.marginTop) + 'px'
            }

            window.onmouseup = function(e) {
                if (BOARD_ELM.selected == null) return

                if (BOARD_ELM.selected.isSliding) return

                var x = Math.round((e.clientX - BOARD_BOX.x) / BOARD_ELM.selected.width - .5)
                var y = Math.round((e.clientY - BOARD_BOX.y) / BOARD_ELM.selected.height - .5)

                if (SIDE == 'b') { y = 7 - y; x = 7 - x }

                console.log(x, ALPHABET[x] + (8 - y))

                BOARD_ELM.to = ALPHABET[x] + (8 - y)

                var move = CHESS.move({from: BOARD_ELM.from, to: BOARD_ELM.to, promotion: 'q'})

                BOARD_ELM.drag = false
                
                if (move == null) {
                    BOARD_ELM.selected.isSliding = true

                    var piece = BOARD_ELM.selected

                    BOARD_ELM.selected = null
                    BOARD_ELM.from = null
                    BOARD_ELM.to = null

                    var dropback = piece.animate([
                        { transform: 'translateY(' + (-parseInt(piece.style.top, 10)) + 'px) translateX(' + (-parseInt(piece.style.left, 10)) + 'px) rotateY(360deg)' }
                    ], { duration: 400, easing: 'ease-in-out' })

                    dropback.onfinish = function () {
                        piece.isSliding = false
                        piece.style.left = 0
                        piece.style.top = 0
                        piece.style.zIndex = 1
                    }

                    return
                }

                var square_elm = document.getElementById(BOARD_ELM.to)

                if (square_elm.hasChildNodes()) { square_elm.innerHTML = ''; square_elm.appendChild(hDiv()) }

                square_elm.appendChild(BOARD_ELM.selected)

                BOARD_ELM.selected.style.zIndex = 1
                BOARD_ELM.selected.style.left = 0
                BOARD_ELM.selected.style.top = 0
                BOARD_ELM.selected = null
                BOARD_ELM.from = null
                BOARD_ELM.to = null

                removeHSquares()

                switch (move.flags) {
                    case 'e': AUDIO.capture.play(); break
                    case 'c': AUDIO.capture.play(); break
                    case 'p': AUDIO.move.play(); break
                    case 'k': AUDIO.move.play(); break
                    case 'q': AUDIO.move.play(); break
                    case 'b': AUDIO.move.play(); break
                    case 'n': AUDIO.move.play(); break
                }

                checkPosition()
            }
        },

        move: function(from, to) {
            var move = CHESS.move({ from, to, promotion: 'q'})

            if (move == null) return

            var piece = document.getElementById(from).getElementsByClassName('piece')[0]
            var from_square = document.getElementById(from)
            var to_square = document.getElementById(to)

            if (piece.isSliding) return

            piece.isSliding = true
            
            removeHSquares()

            var slide = piece.animate([
                { transform: 'translateY(' + (-parseInt(from_square.style.marginTop, 10) + parseInt(to_square.style.marginTop, 10)) + 'px) translateX(' + (-parseInt(from_square.style.marginLeft, 10) + parseInt(to_square.style.marginLeft, 10)) + 'px)' }
            ], { duration: 400, easing: 'ease-in-out' })

            slide.onfinish = function() {
                to_square.appendChild(piece)
                piece.isSliding = false
                piece.style.zIndex = 1
            }
            
            from_square.getElementsByClassName('highlight_div')[0].classList.add('highlighted_3')
            to_square.getElementsByClassName('highlight_div')[0].classList.add('highlighted_3')

            switch (move.flags) {
                case 'e': AUDIO.capture.play(); break
                case 'c': AUDIO.capture.play(); break
                case 'p': AUDIO.move.play(); break
                case 'k': AUDIO.move.play(); break
                case 'q': AUDIO.move.play(); break
                case 'b': AUDIO.move.play(); break
                case 'n': AUDIO.move.play(); break
            }

            checkPosition()
        }
    }

    return chessboard
}