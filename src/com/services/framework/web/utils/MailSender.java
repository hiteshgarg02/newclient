/**
 * 
 */
package com.services.framework.web.utils;

import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.Address;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeUtility;
import javax.mail.util.ByteArrayDataSource;
import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 * The purpose of this class is to provide a utility class for sending mails
 * through an SMTP server. It is also possible to add attachments to the mail.
 * <P>
 * 
 * MailSender get all mailing informations from the current JNDI context in
 * order have access to a declared <code>javax.mail.Session</code> object. *
 * There are two ways for designing and sending an email:
 *
 * <UL>
 * <LI>By using each method individually,
 * <LI>Or by providing an XML file based on mailmessage.dtd.
 * </UL>
 *
 * <P>
 * First of all, by using the direct methods, you have to follow these steps :
 *
 * <OL>
 * <LI>Once this class has been instanciated, create a new mail by calling
 * newMail();
 * <LI>Set the email address of the sender with setFrom("me@xx.ibm.com");
 * <LI>Set the recepient of the mail with addRecepientTO("him@xx.ibm.com"); (as
 * many times as needed). (addRecepientCC is also possible)
 * <LI>Set the subject of the mail with setSubject("Request pricing approval");
 * <LI>Set the text of the mail with setText("Here is the body of the mail");
 * <LI>(optional) Add a file attachment with addAttachment(filename); (as many
 * times as needed).
 * <LI>Then finally, send the mail with send();
 * </OL>
 *
 * <P>
 * Else, if you wish to use an XML file based on the mailmessage.dtd, you should
 * pass an XMLObject to the parseAndSendMail method. This method parses the XML
 * file and finds the relevant information in order to build the mail message.
 * For each field (From, To, CC, attachments, etc...) it calls the methods we've
 * discussed above.
 *
 * @author Guillaume Laforge
 * @version 1.2 Use JavaMail session
 */
public class MailSender {

	/**
	 * Defines the default character set that will be used to compose the
	 * content of messages.
	 */
	public static final String DEFAUL_CHARACTERSET = "UTF-8";

	/**
	 * Defines the character set that will be used to compose the content of
	 * messages.
	 */
	private String characterSet = DEFAUL_CHARACTERSET;

	/**
	 * Determines if an acknowledgement e-mail must be sent back to the sender
	 * once the message has been received.
	 */
	private boolean acknowledgement = false;

	/**
	 * current mailing session
	 */
	private Session session = null;

	/**
	 * the message that will be sent
	 */
	private MimeMessage message = null;

	/**
	 * a container containing text and file attachments
	 */
	private Multipart multipart = null;

	/**
	 * @return the characterSet
	 */
	public String getCharacterSet() {
		return characterSet;
	}

	/**
	 * @param characterSet
	 *            the characterSet to set
	 */
	public void setCharacterSet(String characterSet) {
		this.characterSet = characterSet;
	}

	/**
	 * @return the acknowledgement
	 */
	public boolean isAcknowledgement() {
		return acknowledgement;
	}

	/**
	 * @param acknowledgement
	 *            the acknowledgement to set
	 */
	public void setAcknowledgement(boolean acknowledgement) {
		this.acknowledgement = acknowledgement;
	}

	/**
	 * Starts a new empty mail.
	 */
	public void newMail() {

		// creates a new MIME Message with the current session
		message = new MimeMessage(session);

		// creates a new multipart which can contain the text of the mail and
		// also attached files
		multipart = new MimeMultipart();

	}

	/**
	 * Set the email address of the sender (It is possible that this email maybe
	 * invalid).
	 * 
	 * @param from
	 *            String representing the email address
	 * @throws Exception
	 */
	public void setFrom(String from) throws Exception {

		try {
			// defines the address of the sender
			message.setFrom(new InternetAddress(from));
		} catch (Exception e) {

			throw new Exception(getExceptionString(MailSender.class,
					"Could not set the sender address: " + from), e);
		}

	}

	public static String getExceptionString(Class className, String text) {
		return className.getName() + " " + text;

	}

	/**
	 * Set the email address of the sender (It is possible that this email maybe
	 * invalid).
	 * 
	 * @param from
	 *            String representing the email address
	 * @param displayName
	 *            String representing the display name of sender
	 * @throws Exception
	 */
	public void setFrom(String from, String displayName) throws Exception {

		try {
			// defines the address of the sender
			message.setFrom(new InternetAddress(from, displayName));
		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not set the sender address: " + from), e);
		}

	}

	/**
	 * Define the subject of this email.
	 * 
	 * @param subject
	 *            String the subject of the mail
	 * @throws Exception
	 */
	public void setSubject(String subject) throws Exception {

		try {
			message.setSubject(subject);
		} catch (MessagingException e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not set the subject of the mail."), e);
		}
	}

	/**
	 * Define the subject of this email.
	 * 
	 * @param subject
	 *            String the subject of the mail
	 * @param charactercode
	 * @throws Exception
	 */
	public void setSubject(String subject, String charactercode)
			throws Exception {

		try {
			message.setSubject(subject, charactercode);
			message.setHeader("Subject",
					(message.getHeader("Subject")[0]).replaceAll("\r\n ", " "));
		} catch (MessagingException e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not set the subject of the mail."), e);
		}

	}

	/**
	 * Adds some text to the body of the e-mail.
	 * 
	 * @param text
	 *            The text to add
	 * @throws Exception
	 */
	public void addText(String text) throws Exception {

		try {
			// creates a new bodypart to be added to the multipart container
			MimeBodyPart messageBodyPart = new MimeBodyPart();
			// defines the text of the message
			messageBodyPart.setText(
					System.getProperty("line.separator") + text,
					getCharacterSet());
			// adds this text to the multipart
			multipart.addBodyPart(messageBodyPart);
		} catch (MessagingException e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add the text."), e);
		}
	}

	public void addHTMLText(String htmlText) throws Exception {

		try {
			// creates a new bodypart to be added to the multipart container
			MimeBodyPart messageBodyPart = new MimeBodyPart();
			// defines the text of the message
			messageBodyPart.setContent(htmlText, "text/html; charset=UTF-8");
			// add this text to the multipart
			multipart.addBodyPart(messageBodyPart);
		} catch (MessagingException e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add the html text."), e);
		}
	}

	/**
	 * Define the text of the email to be sent.
	 * 
	 * @param msg
	 *            String the text body
	 * @throws Exception
	 */
	/*
	 * public void setText(String msg) throws Exception { try { // creates a new
	 * bodypart to be added to the multipart container MimeBodyPart
	 * messageBodyPart = new MimeBodyPart(); // defines the text of the message
	 * messageBodyPart.setText(System.getProperty("line.separator") + msg,
	 * getCharacterSet()); // adds this text to the multipart
	 * multipart.addBodyPart(messageBodyPart); } catch (MessagingException e) {
	 * throw new
	 * Exception(BatchConnectorHelper.getExceptionString(MailSender.class,
	 * "Could not set the text"), e); } }
	 */

	/**
	 * Add a recipient(CC) to the list of recipients of this email.
	 *
	 * @param email
	 *            String a String representing the email address
	 * @throws Exception
	 */
	public void addRecipientCC(String email) throws Exception {
		try {
			// adds a new recipient in the CC (Carbon Copy) field
			message.addRecipient(Message.RecipientType.CC, new InternetAddress(
					email));
		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add a recipient (CC) to the mail."), e);
		}
	}

	/**
	 * Add a recipient(TO) to the list of recipients of this email.
	 *
	 * @param email
	 *            String a String representing the email address
	 * @throws Exception
	 */
	public void addRecipientTO(String email) throws Exception {
		try {
			// adds a new recipient in the To field
			message.addRecipient(Message.RecipientType.TO, new InternetAddress(
					email));
		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add a recipient (TO) to the mail."), e);
		}
	}

	public void addAttachmentElement(byte[] in, String name) throws Exception {
		try {
			// a mail containing attachments has a multipart content
			// a BodyPart is created that will contain the attachment
			BodyPart messageBodyPart = new MimeBodyPart();

			// defines a data source
			DataSource source = new ByteArrayDataSource(in, "text/html"); 
			// defines a data handler
			messageBodyPart.setDataHandler(new DataHandler(source));

			// defines the name that will appear when the recipient
			// detaches the attached file
			messageBodyPart.setFileName(name);

			// adds a blank line for readability
			addText(System.getProperty("line.separator"));

			// adds this body part to the multipart container
			multipart.addBodyPart(messageBodyPart);

		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add an attachment to the mail."), e);
		}
	}

	/**
	 * Method for adding an attachment to the message.
	 *
	 * @param in
	 *            String the Base64 encoded content of the attachment
	 * @param name
	 *            String the name of the attachment
	 * @exception CTMException
	 */
	public void addAttachmentElement(String in, String name) throws Exception {
		try {
			// a mail containing attachments has a multipart content
			// a BodyPart is created that will contain the attachment
			BodyPart messageBodyPart = new MimeBodyPart();

			// defines a data source
			// DataSource source = new
			// StreamDataSource(Base64Encoding.decodeFromString(in), name);
			DataSource source = null;
			// new StreamDataSource(in, name);
			// defines a data handler
			messageBodyPart.setDataHandler(new DataHandler(source));

			// defines the name that will appear when the recipient
			// detaches the attached file
			messageBodyPart.setFileName(name);

			// adds a blank line for readability
			addText(System.getProperty("line.separator"));

			// adds this body part to the multipart container
			multipart.addBodyPart(messageBodyPart);

		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add an attachment to the mail."), e);
		}
	}

	/**
	 * Method for adding an attachment to the message.
	 * 
	 * @param fileName
	 *            The path and file name to attach.
	 * @throws CTMException
	 *             Thrown whenever an error is raised while attempting to attach
	 *             the file.
	 */
	public void addAttachmentPath(String fileName) throws Exception {
		try {
			// a mail containing attachments has a multipart content
			// a BodyPart is created that will contain the attachment
			BodyPart messageBodyPart = new MimeBodyPart();

			// defines a data source
			DataSource source = new FileDataSource(fileName);
			// defines a data handler
			messageBodyPart.setDataHandler(new DataHandler(source));
			// defines the name that will appear when the recepient
			// detaches the attached file
			messageBodyPart.setFileName(fileName);

			// adds a blank line for readability
			addText(System.getProperty("line.separator"));

			// adds this body part to the multipart container
			multipart.addBodyPart(messageBodyPart);

		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add an attachment to the mail."), e);
		}
	}

	/**
	 * Sends the mail
	 * 
	 * @throws Exception
	 */
	public void send() throws Exception {

		if (acknowledgement) {

			Address[] fromAddresses = null;
			try {
				fromAddresses = message.getFrom();
			} catch (MessagingException e) {
				throw new Exception(
						getExceptionString(MailSender.class,
								"Unable to get the From Internet address of a message."),
						e);
			}
			if (fromAddresses == null) {
				throw new Exception(
						getExceptionString(
								MailSender.class,
								"Illegal attempt to send an e-mal with no sender address.According to \"IBM Architecture and Standards: Mail - (GWA Specific)\": Sender address of ALL messages sent must point to an actively monitored mail address in an IBM domain."));
			}
			if (fromAddresses == null || fromAddresses.length < 1) {
				throw new Exception(
						getExceptionString(
								MailSender.class,
								"A message with acknoledgement option set to true can not be sent with no From value"));
			}
			try {
				message.addHeader("Disposition-Notification-To",
						fromAddresses[0].toString());
			} catch (MessagingException e) {
				throw new Exception(
						getExceptionString(MailSender.class,
								" Could not add a Disposition-Notification-To header value"),
						e);
			}
		}
		try {
			// defines the content of the message by adding the multipart
			// containing the text of the mail and also the attached files
			message.setContent(multipart);
		} catch (Exception ex) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add multipart content."), ex);
		}

		try {
			// sends the mail by forwarding it to the smtp server defined in
			// the properties file
			Transport.send(message);
		} catch (Exception ex) {
			// Updated B. Denoix enhance message
			String msg = "Could not send the mail message: ";
			ex.printStackTrace();
			String exMsg = ex.getMessage();
			if (exMsg != null)
				msg += exMsg;
			else
				msg += "(no reason returned in exception).";
			throw new Exception(getExceptionString(MailSender.class, msg), ex);
		}
	}

	/**
	 * Initializes a new MailSender ready to send mail via the SMTP protocol. No
	 * authentication when connecting to the SMTP server will be done.
	 * 
	 * @param hostname
	 *            The TCP/IP hostname of the SMTP relay to use.
	 * @param port
	 *            The TCP/IP port id of the SMTP relay to use.
	 */
	public MailSender(String hostname, int port) {

		Properties mailProps = new Properties();
		// mailProps.setProperty("mail.transport.protocol", "smtp");
		mailProps.setProperty("mail.smtp.host", hostname);
		// mailProps.setProperty("mail.smtp.localhost", "localhost");
		mailProps.setProperty("mail.smtp.port", String.valueOf(port));

		session = Session.getInstance(mailProps, null);
		newMail();

	}

	/**
	 * MailSender constructor that calls the initialize method.
	 * 
	 * @param jndiName
	 *            The JNDI name used to locate the JavaMail session
	 * @throws Exception
	 *             Thrown whenever the JavaMail session can not be initialized.
	 */
	public MailSender(String jndiName) throws Exception {

		try {
			// Creates a JNDI Context
			InitialContext context = new InitialContext();
			// Retrieve the JavaMail session
			debug(MailSender.class, "JNDI " + jndiName);
			Object obj = context.lookup(jndiName);
			debug(MailSender.class, "MAILSENDER:: Object class name  :: "
					+ obj.getClass().getName());
			debug(MailSender.class, "Object " + obj);
			this.session = (Session) obj;

		} catch (NamingException e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Cannot retrieve JavaMail session using JNDI name "
							+ jndiName), e);
		}
		newMail();
	}

	public static void debug(Class className, String text) {
		System.out.println("DEBUG: " + className.getName() + " " + text);
	}
	
	public void addQuoteAttachmentElement(String quoteAttachmentContent, String name) throws Exception {
		try {
			// a mail containing attachments has a multipart content
			// a BodyPart is created that will contain the attachment
			BodyPart messageBodyPart = new MimeBodyPart();

			// defines a data source
			DataSource source = new ByteArrayDataSource(quoteAttachmentContent.getBytes("UTF-8"), "text/plain"); 
			// defines a data handler
			messageBodyPart.setDataHandler(new DataHandler(source));

			// defines the name that will appear when the recipient
			// detaches the attached file
			messageBodyPart.setFileName(name);

			// adds a blank line for readability
			addText(System.getProperty("line.separator"));

			// adds this body part to the multipart container
			multipart.addBodyPart(messageBodyPart);

		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add an attachment to the mail."), e);
		}
	}
	
	public void addQuoteAttachmentElement(byte[] quoteAttachmentContent, String name, String mimeType) throws Exception {
		try {
			// a mail containing attachments has a multipart content
			// a BodyPart is created that will contain the attachment
			BodyPart messageBodyPart = new MimeBodyPart();

			// defines a data source
			DataSource source = new ByteArrayDataSource(quoteAttachmentContent, mimeType); 
			// defines a data handler
			messageBodyPart.setDataHandler(new DataHandler(source));

			// defines the name that will appear when the recipient
			// detaches the attached file
			messageBodyPart.setFileName(MimeUtility.encodeText(name, "UTF-8", null));

			// adds a blank line for readability
			addText(System.getProperty("line.separator"));

			// adds this body part to the multipart container
			multipart.addBodyPart(messageBodyPart);

		} catch (Exception e) {
			throw new Exception(getExceptionString(MailSender.class,
					"Could not add an attachment to the mail."), e);
		}
	}
}
