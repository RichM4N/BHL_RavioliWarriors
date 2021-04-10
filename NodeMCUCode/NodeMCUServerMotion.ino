#include <ESP8266HTTPClient.h>

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <EEPROM.h>

#include <uri/UriBraces.h>

const char* ssid = "Dom1";
const char* password = "Maciek1807";
const char* WiFi_hostname = "NodeMCU";

const char* Type = "Socket";

int relayState = 0;
int offsetToLink = 0;

ESP8266WebServer server(80);

void writeToEprom(String &strToWrite){
  int address = 0;
  byte len = strToWrite.length();
  EEPROM.write(address, len);
  for(int i = 0; i < len; i ++)
  {
    EEPROM.write(address + i + 1, strToWrite[i]); 
  }
  EEPROM.commit();
}

String readFromEprom(){
  int address = 0;
  int checkval = EEPROM.read(address);
  
  if(checkval == 255)
  {
    String out = "None";
    return out;
  }else{
    char charArr[checkval + 1];
    for(int i = 0; i < checkval; i++)
    {
      charArr[i] = EEPROM.read(address + i + 1);
    }
    charArr[checkval] = '\0';
    return String(charArr);
  }
}

void InitResponse(){
  String response = "NodeMCU&IP";
  response += WiFi.localIP().toString();
  response += "&Type";
  response += Type;

  server.send(200, "text/plain", response);
}

void SetName(){
  String nameToSet = server.pathArg(0);
  writeToEprom(nameToSet);
  server.send(200, "text/plain", "ok");
}

void GetState(){
  String response = "NodeMCU&IP";
  response += WiFi.localIP().toString();
  response += "&Type";
  response += Type;
  response += "&Name";
  response += readFromEprom();
  response += "&Flipstate";
  response += relayState;
  

  server.send(200, "text/plain", response);
}

void FlipSwitch(){
  Serial.println("flipped");
  if(relayState == 0)
  {
     relayState = 1;
     digitalWrite(D2, HIGH);
  }else{
    relayState = 0;
    digitalWrite(D2, LOW);
  }
  String state = String(relayState);
  String response = "&Flipstate";
  response += state;
  server.send(200, "text/plain", response);
}

void SetOn(){
  if(relayState == 0)
  {
     relayState = 1;
     digitalWrite(D2, HIGH);
  }
  server.send(200, "text/plain", "ok");
}

void setup() {
  pinMode(D0, INPUT);
  pinMode(D2, OUTPUT);
  digitalWrite(D2, LOW);
  Serial.begin(74880);
  EEPROM.begin(512);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.hostname(WiFi_hostname);
  WiFi.begin(ssid, password);
  MDNS.begin(WiFi_hostname);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
   
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());
  
  server.on("/init", []() {
    InitResponse();
  });

  server.on("/getState", []() {
    GetState();
  });

  server.on(UriBraces("/setName/{}"), []() {
    SetName();
  });

  server.on("/flip", []() {
    FlipSwitch();
  });

  server.on("/on", []() {
    SetOn();
  });

  server.begin();
  
}

void loop() {

  server.handleClient();
  MDNS.update();

  if(digitalRead(D0) == 1)
  {
    HTTPClient http;

    String destination = "http://";
    destination += readFromEprom();
    destination += "/on";

    http.begin(destination);
    Serial.println(destination);
    http.GET();
    http.end();
  }
  
  delay(10);

}
