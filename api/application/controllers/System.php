<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class System extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('system_model', 'system');
	}

	public function feedback(){

		$objReturn = new stdClass;

		//if($this->input->post('json')){

			$json = $this->input->post('json');
			//$json = '{"name":"10","answer":"awesome","message": "testing"}';

			$objFeedback = json_decode($json);
			$objReturn->status = "success";
			$objReturn->errorCode = "0";
			$objReturn->returnID = $this->system->insert_feedback($objFeedback);

		//}

		print_r($objReturn);
		die();

		$viewData['echoJSON'] = json_encode($objReturn);
		$this->load->view('jsonDump', $viewData);

	}

}
