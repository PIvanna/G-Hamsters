$(function () {
  let timer1;
  let size;
  let totalPieces;
  let pieceSize;

  $("#show-preview").change(function () {
    if (this.checked) {
      $("#preview-section").show();
    } else {
      $("#preview-section").hide();
    }
  });

  $("#go-back").click(() => {
    window.location.href = "main-window.html"; // ← змінити на потрібний файл
  });

  function createPuzzle() {
    const selectedImage = localStorage.getItem("selectedImage");
    console.log("Selected image:", selectedImage);
    $("#puzzle-preview").attr("src", selectedImage);
    $(".container, .board").empty();
    pieceSize = 400 / size;

    $(".container, .board").css({
      "grid-template-columns": `repeat(${size}, ${pieceSize}px)`,
      "grid-template-rows": `repeat(${size}, ${pieceSize}px)`,
    });

    let ids = [];
    for (let i = 0; i < totalPieces; i++) ids.push(i);
    ids = ids.sort(() => Math.random() - 0.5);

    // Створення пазлів
    ids.forEach((id) => {
      const row = Math.floor(id / size);
      const col = id % size;
      $("<div>")
        .addClass("piece")
        .attr("data-id", id) // <-- додано
        .css({
          width: pieceSize,
          height: pieceSize,
          backgroundImage: `url(${selectedImage})`,
          backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
          backgroundSize: `${size * pieceSize}px ${size * pieceSize}px`,
        })
        .appendTo(".container");
    });

    // Створення слотів
    for (let i = 0; i < totalPieces; i++) {
      $("<div>")
        .addClass("slot")
        .css({
          width: pieceSize,
          height: pieceSize,
        })
        .appendTo(".board");
    }

    $(".piece").draggable({
      revert: "invalid",
      stack: ".piece",
    });

    $(".slot").droppable({
      accept: ".piece",
      drop: function (event, ui) {
        if ($(this).children().length === 0) {
          $(this).append(ui.draggable);
          ui.draggable.css({
            position: "absolute",
            top: 0,
            left: 0,
          });
        }
      },
    });

    $(".container").droppable({
      accept: ".piece",
      drop: function (event, ui) {
        $(this).append(ui.draggable);
        ui.draggable.css({
          position: "relative",
          top: "",
          left: "",
        });
      },
    });
  }

  function startTimer(duration) {
    if (duration === 0) {
      $(".timer").text("∞");
      return;
    }

    let sec = duration;
    timer1 = setInterval(() => {
      sec--;
      const min = Math.floor(sec / 60);
      const secStr = sec % 60 < 10 ? "0" + (sec % 60) : sec % 60;
      $(".timer").text(`${min < 10 ? "0" + min : min} : ${secStr}`);

      if (sec <= 0) {
        clearInterval(timer1);
        $(".check-menu").show();
        $(".pity").show();
        $("#new").prop("disabled", false);
        $("#check").prop("disabled", true);
      }
    }, 1000);
  }

  $("#start").click(() => {
    size = parseInt($("#difficulty").val());
    totalPieces = size * size;
    const timeValue = parseInt($("#time-select").val());
    createPuzzle();
    startTimer(timeValue);
    $("#check, #new").prop("disabled", false);
    $("#start").prop("disabled", true);
  });

  $("#new").click(() => {
    clearInterval(timer1);
    createPuzzle();
    const timeValue = parseInt($("#time-select").val());
    $(".timer").text(timeValue === 0 ? "∞" : "01 : 00");
    $("#check").prop("disabled", true);
    $("#new").prop("disabled", true);
    $("#start").prop("disabled", false);
  });

  $("#check").click(() => {
    $(".check-menu").show();
    $(".time-less").show();
    $("#check, #start, #new").prop("disabled", true);
  });

  $("#closeBut").click(() => {
    $(".check-menu").hide();
    $(".time-less").hide();
    $("#check").prop("disabled", false);
  });

  $("#closeResult").click(() => {
    $(".check-menu").hide();
    $(".result").hide();
    $("#new").prop("disabled", false);
  });

  $("#check-check").click(() => {
    let correct = true;

    // Очистити попередні бордери
    $(".piece").css("border", "none");

    $(".board .slot").each(function (index) {
      const piece = $(this).children(".piece");

      if (piece.length === 0 || parseInt(piece.attr("data-id")) !== index) {
        correct = false;
        if (piece.length > 0) {
          piece.css("border", "2px solid red");
        }
      }
    });

    $(".time-less").hide();
    $(".result").show();
    $(".result-p").text(
      correct ? "🎉 Вітаємо! Ви склали пазл!" : "❌ Упс! Спробуйте ще раз!"
    );
    $(".result-p").toggleClass("fail", !correct);

    clearInterval(timer1);
  });

  $("#close-pity").click(() => {
    $(".check-menu").hide();
    $(".pity").hide();
  });
});
