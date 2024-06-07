import cv2
import face_recognition
import os
import time

# Function to load images and their corresponding encodings from a folder
def load_images_from_folder(folder):
    images = []
    names = []
    for filename in os.listdir(folder):
        path = os.path.join(folder, filename)
        img = face_recognition.load_image_file(path)
        encoding = face_recognition.face_encodings(img)
        if len(encoding) > 0:
            images.append(encoding[0])
            names.append(os.path.splitext(filename)[0])
    return images, names

# Load known face encodings and names from the folder
known_encodings, known_names = load_images_from_folder("known_faces")

# Ensure the unknown_faces directory exists
unknown_faces_dir = "unknown_faces"
os.makedirs(unknown_faces_dir, exist_ok=True)

# Open a connection to the camera (0 is usually the default camera)
cap = cv2.VideoCapture(0)

# Check if the camera is opened successfully
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

unknown_face_captured = False  # Flag to check if unknown face has been captured

while True:
    # Read a frame from the camera
    ret, frame = cap.read()

    # Convert the frame to RGB for face recognition
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Find all face locations and face encodings in the current frame
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    name = "Unknown"

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        # Check if the face matches any known faces
        matches = face_recognition.compare_faces(known_encodings, face_encoding)

        # If a match is found, use the name of the first matching known face
        if True in matches:
            first_match_index = matches.index(True)
            name = known_names[first_match_index]

        # Draw a rectangle and label on the face
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.5, (255, 255, 255), 1)

    # Display the frame
    cv2.imshow("Face Recognition", frame)

    # If the person is not recognized, capture and save the face image
    if name == "Unknown" and not unknown_face_captured:
        img_path = os.path.join(unknown_faces_dir, f"unknown_{int(time.time())}.jpg")
        cv2.imwrite(img_path, frame)
        print(f"Unrecognized face captured and saved as {img_path}")
        unknown_face_captured = True  # Set the flag

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close the OpenCV window
cap.release()
cv2.destroyAllWindows()
