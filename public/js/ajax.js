$(document).ready(function(){
    
    $('#add-option').click(function(){
        var numOpt = $('#options :input').length + 1;
        var opt = '<div class="form-group">';
        opt+= '<div class="input-group">'+
                  '<input class="form-control" maxlength="30" name="options[]"'+
                'type="text" placeholder="option '+numOpt+'"/>'+
                  '<span class="input-group-btn">'+
                    '<span class="btn btn-primary btn-fab btn-fab-mini delete-option">'+
                      '<i class="material-icons">clear</i>'+
                    '</span>'+
                  '</span>'+
                '</div>';
        opt+= '<span class="material-input"></span></div>';
        $('#options').append(opt);
    });
    
    
});

$(document).on('click','.delete-option',function(){
    console.log('here');
    var option = $(this).parents('.form-group');
    option.remove();
});

$(document).on('click','.delete-poll',function(){
    var poll = $(this).parents('li');
    var poll_id = poll.attr('data-poll-id');
    $.ajax('/mypolls/delete',{
        method:'DELETE',
        data:{poll_id:poll_id},
        success:function(response){
            console.log('it was deleted');
            poll.remove();
        },
        error:function(response){
            console.log('there was an error');
            console.log(JSON.stringify(response));
        }
    });
    
});