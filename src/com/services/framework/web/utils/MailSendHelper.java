/**
 * 
 *//*
package com.services.framework.web.utils;

import java.util.StringTokenizer;

*//**
 * @author Sandesh
 *
 *//*
public class MailSendHelper{

	*//**
	 * This method is used to send the mail
	 * 
	 * @param subject
	 * @param buffer
	 * @param text
	 * @param recipient
	 * @param fileContent TODO
	 * @param fileName TODO
	 * @throws Exception
	 *//*
	public static void sendMail(String subject, StringBuffer buffer,
			String text, String recipient, String from, String ccRecipient, byte[] fileContent, String fileName) throws Exception {

		Env config = ServiceBeanFactory.getEnvConfig();
		String hostname = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_HOSTNAME);
		String port = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_PORT);

		MailSender mailSender = new MailSender(hostname, Integer.parseInt(port));
		mailSender.newMail();

		// Set the subject in mail
		mailSender.setSubject(subject,mailSender.getCharacterSet());

		if(null!= buffer && buffer.length()>1)
		{
			mailSender.addText(buffer.toString());
		}
		
		// add HTML Text
		mailSender.addHTMLText(text);

		// set the sender's address
		mailSender.setFrom(from);
		
		// add the recipients(TO)
		StringTokenizer st = new StringTokenizer(recipient, ",");
		while (st.hasMoreElements()) {
			mailSender.addRecipientTO(st.nextToken());
		}
		if(null!=ccRecipient){
			StringTokenizer st1 = new StringTokenizer(ccRecipient, ",");
			while (st1.hasMoreElements()) {
				mailSender.addRecipientCC(st1.nextToken());
			}
		}
		//add Attachment
		if (null != fileContent) {
			mailSender.addAttachmentElement(fileContent, fileName);

		}

		// send the mail
		mailSender.send();
	}
	*//**
	 * This method is used to send the mail with UTF-8 encoding for the attachment and subject
	 * 
	 * @param subject
	 * @param buffer
	 * @param text
	 * @param recipient
	 * @param fileContent TODO
	 * @param fileName TODO
	 * @throws Exception
	 *//*
	public static void sendMail(String subject, StringBuffer buffer,
			String text, String recipient, String from, String ccRecipient, String fileContent, String fileName) throws Exception {

		Env config = ServiceBeanFactory.getEnvConfig();
		String hostname = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_HOSTNAME);
		String port = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_PORT);

		MailSender mailSender = new MailSender(hostname, Integer.parseInt(port));
		mailSender.newMail();

		// Set the subject in mail
		mailSender.setSubject(subject,mailSender.getCharacterSet());
		
		String newText = "";
		if(null!= buffer && buffer.length()>1)
		{
			newText = buffer.toString();
			//mailSender.addText(buffer.toString());
		}
		newText = newText + "<br/><br/>"+text; 
		// add HTML Text
		//mailSender.addHTMLText("<br/><br/>"+text);
		mailSender.addHTMLText(newText);
		

		// set the sender's address
		mailSender.setFrom(from);
		
		// add the recipients(TO)
		StringTokenizer st = new StringTokenizer(recipient, ",");
		while (st.hasMoreElements()) {
			mailSender.addRecipientTO(st.nextToken());
		}
		if(null!=ccRecipient){
			StringTokenizer st1 = new StringTokenizer(ccRecipient, ",");
			while (st1.hasMoreElements()) {
				mailSender.addRecipientCC(st1.nextToken());
			}
		}
		//add Attachment
		if(null!=fileContent && !fileContent.equals(""))
		{
			mailSender.addAttachmentElement(fileContent.getBytes(mailSender.getCharacterSet()), fileName);
		}
		// send the mail
		mailSender.send();
	}

	public static String getExceptionString(Class className, String text) {
		return className.getName() + " " + text;

	}


	public static void sendMail(String subject, StringBuffer buffer, String text, String recipient, String from, String ccRecipient, 
			byte[] fileContent, String fileName, String quoteAttachmentContent, String quoteAttachmentName) throws Exception {

		Env config = ServiceBeanFactory.getEnvConfig();
		String hostname = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_HOSTNAME);
		String port = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_PORT);

		MailSender mailSender = new MailSender(hostname, Integer.parseInt(port));
		mailSender.newMail();
		
		// Set the subject in mail
		mailSender.setSubject(subject,mailSender.getCharacterSet());
		
		// add the text to be sent in mail
		if (null != buffer && buffer.length() > 1) {
			mailSender.addText(buffer.toString());
		}

		// add HTML Text
		mailSender.addHTMLText(text);
		if(null!=quoteAttachmentContent)
		{
			mailSender.addQuoteAttachmentElement(quoteAttachmentContent, quoteAttachmentName);
		}
		
		// set the sender's address
		mailSender.setFrom(from);
		
		// add the recipients(TO)
		StringTokenizer st = new StringTokenizer(recipient, ",");
		while (st.hasMoreElements()) {
			mailSender.addRecipientTO(st.nextToken());
		}
		if(null!=ccRecipient){
			StringTokenizer st1 = new StringTokenizer(ccRecipient, ",");
			while (st1.hasMoreElements()) {
				mailSender.addRecipientCC(st1.nextToken());
			}
		}

		// add Attachment
		if (null != fileContent) {
			mailSender.addAttachmentElement(fileContent, fileName);
		}

		// send the mail
		mailSender.send();
	}
	public static void sendMail(String subject, StringBuffer buffer, String text, String recipient, String from, String ccRecipient, 
			byte[] fileContent, String fileName, String[] docContents,
			String[] docNames) throws Exception {

		Env config = ServiceBeanFactory.getEnvConfig();
		String hostname = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_HOSTNAME);
		String port = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_PORT);

		MailSender mailSender = new MailSender(hostname, Integer.parseInt(port));
		mailSender.newMail();
		// Set the subject in mail
		mailSender.setSubject(subject,mailSender.getCharacterSet());

		// add the text to be sent in mail
		if(null!= buffer && buffer.length()>1)
		{
			mailSender.addText(buffer.toString());
		}
		
		// add HTML Text
		mailSender.addHTMLText(text);

		// set the sender's address
		mailSender.setFrom(from);
		
		// add the recipients(TO)
		StringTokenizer st = new StringTokenizer(recipient, ",");
		while (st.hasMoreElements()) {
			mailSender.addRecipientTO(st.nextToken());
		}
		if(null!=ccRecipient){
			StringTokenizer st1 = new StringTokenizer(ccRecipient, ",");
			while (st1.hasMoreElements()) {
				mailSender.addRecipientCC(st1.nextToken());
			}
		}
		// add Attachment
		if (null != fileContent) {
			mailSender.addAttachmentElement(fileContent, fileName);

		}

		if(docNames !=null){
			for (int i = 0; i < docNames.length; i++) {
				if(docContents[i]!=null && docNames[i]!=null){
					mailSender.addQuoteAttachmentElement(docContents[i], docNames[i]);
				}
			}
		}	
		// send the mail
		mailSender.send();
	}
	
	
	public static void sendMail(String subject, StringBuffer buffer, String text, String recipient, String from, String ccRecipient, 
			byte[] fileContent, String fileName, byte[][] docContents,
			String[] docNames, String[] mimeType) throws Exception {

		Env config = ServiceBeanFactory.getEnvConfig();
		String hostname = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_HOSTNAME);
		String port = config.getStructureByName(EnvConstant.GEN_CONFIG).getString(EnvConstant.MAIL_PORT);

		MailSender mailSender = new MailSender(hostname, Integer.parseInt(port));
		mailSender.newMail();

		// Set the subject in mail
		mailSender.setSubject(subject,mailSender.getCharacterSet());
		
		// add the text to be sent in mail
		if (null != buffer && buffer.length() > 1) {
			mailSender.addText(buffer.toString());
		}
		// add HTML Text
		mailSender.addHTMLText(text);

		// set the sender's address
		mailSender.setFrom(from);
		
		// add the recipients(TO)
		StringTokenizer st = new StringTokenizer(recipient, ",");
		while (st.hasMoreElements()) {
			mailSender.addRecipientTO(st.nextToken());
		}
		if(null!=ccRecipient){
			StringTokenizer st1 = new StringTokenizer(ccRecipient, ",");
			while (st1.hasMoreElements()) {
				mailSender.addRecipientCC(st1.nextToken());
			}
		}
		// add Attachment
		if (null != fileContent) {
			mailSender.addAttachmentElement(fileContent, fileName);
		}
		if(docNames !=null){
			for (int i = 0; i < docNames.length; i++) {
				if(docContents[i]!=null && docNames[i]!=null){
					mailSender.addQuoteAttachmentElement(docContents[i], docNames[i], mimeType[i]);
				}
			}
		}	
		// send the mail
		mailSender.send();
	}

}
*/