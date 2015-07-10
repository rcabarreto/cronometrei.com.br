<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Theme extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('theme_model', 'theme');
	}


	public function loadTheme(){
		if($this->input->post('userid')){
			$objTheme = $this->theme->load_theme($this->input->post('userid'));
		}else{
			$objTheme = $this->theme->get_random_bgimage();
		}
		$viewData['echoJSON'] = json_encode($objTheme[0]);
		$this->load->view('jsonDump', $viewData);
	}

}
