import java.util.Scanner;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.OutputStream;


public class SendCode {
    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        sendFile("a");
    }

    private static void sendFile(String filename) {
        System.out.println("hey");
        try {
            URL url = new URL("https://nodekb-ruoqi.herokuapp.com/ppp");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json; utf-8");
            con.setDoOutput(true);
            String jsonInputString = "{\"name\": \"Upendra\", \"job\":\"Programmer\"}";
            OutputStream os = con.getOutputStream();
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        catch (Exception e) {
            System.out.println("error");
        }
    }
}
