<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('user_model', 'user');
	}

	public function loadUserInfo(){

		if($this->input->post('json')){
			$json = $this->input->post('json');
			// $json = '{"logged":true,"id":"10","facebook_id":"","first_name":"","last_name":"","gender":"","link":"","locale":"","name":"","timezone":"","updated_time":"","verified":true}';
		
			// {
			// 	"logged":true,
			// 	"id":"",
			// 	"facebook_id":"10152835496865807",
			// 	"email":"rcabarreto@gmail.com",
			// 	"first_name":"Rodrigo",
			// 	"last_name":"Barreto",
			// 	"gender":"male",
			// 	"link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/",
			// 	"locale":"pt_BR",
			// 	"name":"Rodrigo Barreto",
			// 	"timezone":-3,
			// 	"updated_time":"2015-06-05T08:17:20+0000",
			// 	"verified":true
			// }

			$objUser = json_decode($json);

			if($objUser->facebook_id!=''){
				if( $this->user->checkUser($objUser, $userID) ){
					$objUser->id = $userID;
				}else{
					$objUser->id = $this->user->insert_user($objUser);
				}
			}elseif($objUser->id!=''){
				$userData = $this->user->load_user($objUser);


			}

			// se tem id, só carrega os dados que estão na tabela e manda
			// se tem facebook_id, verifica se tem dados na tabela, se não tem dados, grava os dados do facebook na tabelax

		}else{
			$objUser = new stdClass;
			$objUser->status = "error";
			$objUser->errorCode = "1";
		}

		$viewData['echoJSON'] = json_encode($objUser);
		$this->load->view('jsonDump', $viewData);

	}

}
