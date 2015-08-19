<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Timer extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('timer_model', 'timer');
	}


	public function recordUserTimer(){

		$objReturn = new stdClass;

		if($this->input->post('json')){
			
			$json = $this->input->post('json');
			//$json = '{"user_id":"10","start":"2015-08-19 17:12:24","end":"2015-08-19 17:12:34","timer":"00:00:07:032"}';

			$objTimer = json_decode($json);
			$objReturn->status = "success";
			$objReturn->errorCode = "0";
			$objReturn->returnID = $this->timer->insert_timer($objTimer);
		}else{
			$objReturn->status = "error";
			$objReturn->errorCode = "1";
			$objReturn->returnID = 0;
		}

		$viewData['echoJSON'] = json_encode($retorno);
		$this->load->view('jsonDump', $viewData);

	}


}
