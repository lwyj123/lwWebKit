<?php
class lwpdo {
    protected $database_name;

    protected $server;

    protected $username;

    protected $password;

    protected $charset;

    protected $port;

    protected $option = array();
    public function __construct($options = null) {
        try{
            $dsn = ''

            if(is_array($options)) {
                foreach ($options as $option => $value) {
                    $this->$option = $value;
                }
            }
            else {
                return false     //构造函数还返回false ?
            }

            if(isset($this->port)) {
                $port = $this->port;
            }

            $has_port = isset($port)

            $dsn = 'mysql:dbname=' . $this->database_name . ';host=' . $this->server . ($has_port ? ';port='.$port : '');

            $this->pdo = new PDO(
                $dsn, 
                $this->username, 
                $this->password, 
                $this->option
            );
        }
        catch(PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    
}