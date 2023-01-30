const server = 
    location.host.indexOf('localhost') > -1 
        ? 'http://localhost:3000' 
        : 'http://node21126-env-4132943.cloud-fr1.unispace.io:11001';

const loadScript = (uri, async = true, type = "text/javascript") => {
    return new Promise((resolve, reject) => {
        try {
            const scriptEle = document.createElement("script");
            scriptEle.type = type;
            scriptEle.async = async;
            scriptEle.src = uri;

            scriptEle.addEventListener("load", (ev) => {
                resolve({ status: true });
            });

            scriptEle.addEventListener("error", (ev) => {
                reject({
                    status: false,
                    message: `Failed to load the script ＄{uri}`
                });
            });

            document.body.appendChild(scriptEle);
        } catch (error) {
            reject(error);
        }
    });
};

function creatLog(logs) {
    logs = logs || [];
    const cont = logs.map((log, index) => (
        `
        <tr>
            <th scope="row">${index + 1}</th>
            <td class="td-link">
                <span>
                    ${log.link.replace(/https:\/\/(www\.)?facebook.com\//, '')}
                </span>
            </td>
            <td>
            ${
                log.status 
                ? '<span class="text-primary">Thành công</span>' 
                : '<span class="text-danger">Thất bại</span>'
            }
            </td>
        </tr>
        `
    ))
    $('#data-log').html(cont.join(''));
}

$(document).ready(async function () {
    const loadingServer = new bootstrap.Modal($('#loading'));
    // loadingServer.show();

    // socket
    await loadScript(`${server}/socket.io/socket.io.js`)
    const socket = io(server, { reconnect: true });

    socket.on('connect', () => {
        console.log('open connect!');
        $('#al-server').hide();
        setTimeout(() => {
            loadingServer.hide();
        }, 1000)
    })

    socket.on('online', (data) => $('#bd-online').html(data));
    socket.on('like', (data) => $('#bd-like').html(data));
    socket.on('total-like', (data) => $('#bd-total-like').html(data));
    socket.on('queue', (data) => $('#bd-queue').html(data));

    socket.on('startLike', () => {
        $('#zone-like-follow').hide();
        $('#zone-like-queue').hide();
        $('#zone-like-no').hide();
        $("#zone-like-proc").show();
        document.getElementById('task').scrollIntoView();
    })

    socket.on('doneLike', () => {
        $('#zone-like-no').show();
        $('#zone-like-follow').show();
        $("#zone-like-proc").hide();
    })

    socket.on('queueLike', (data) => {
        $('#zone-like-follow').hide();
        $("#zone-like-proc").hide();
        $('#zone-like-no').hide();
        $('#zone-like-queue').show();
        $('#queue-me').html(data.pos);
        $('#queue-all').html(data.all);
    })

    socket.on('log', (data) => {
        creatLog(data);
    })

    socket.on('task', (data) => {
        let proc, link;
        if (data) {
            proc = data.proc;
            link = data.link;
            $('#task-bar').show();
            $('#task-link').html(link);
            $('#task-bar').css('width', proc + '%')
            $('#task-bar').attr('aria-valuenow', proc)
            $('#task-bar').html(proc + '%')
        } else {
            $('#task-link').html('');
            $('#task-bar').hide();
        }
    })

    socket.on("disconnect", () => {
        console.log('close connect!');
        $('#al-server').show();
        loadingServer.show();
    });

    // event
    $('#runLike').click(function () {
        const linkPost = $('#linkPost').val().trim();
        if (!linkPost.match(/https:\/\/(www\.)?facebook.com\//)) {
            alert('Oops!');
            return
        }
        socket.emit('runLike', linkPost);
    })

    $('#cancelLike').click(function () {
        socket.emit('cancelLike');
    })
})