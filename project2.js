/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */

		//-----------------------------------------------------------------------------------------------

		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.normbuffer = gl.createBuffer();

		this.lightingEnabled = false;
		this.ambient = 0.5; 
    	this.lightPos = [0.0, 0.0, -3.0];
		this.viewPos = [0.0, 0.0, -3.0];

		//-----------------------------------------------------------------------------------------------

		this.viewPosLoc = gl.getUniformLocation(this.prog, 'viewPos');
		this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
	
		this.specularIntensity = 0.3;  // Default specular intensity
		this.shininess = 8.0;         // Default shininess factor

		//-----------------------------------------------------------------------------------------------

		this.texture1 = null;
		this.texture2 = null;
		this.blendFactor = 0.5;
		this.blendFactorLoc = gl.getUniformLocation(this.prog, 'blendFactor');
		
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */

		//-----------------------------------------------------------------------------------------------

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

		//-----------------------------------------------------------------------------------------------

	}

	setSpecularLight(intensity) {
		this.specularIntensity = intensity;
	}
	
	setShininess(value) {
		this.shininess = value;
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */

		//-----------------------------------------------------------------------------------------------

		gl.uniform1f(this.ambientLoc, this.ambient);
    	gl.uniform3fv(this.viewPosLoc, new Float32Array(this.viewPos || [0.0, 0.0, -3.0]));
		gl.uniform1i(this.enableLightingLoc, this.lightingEnabled);

		//changed for task 3 ------------------------------------------------------------------------------------------

		console.log("Specular Intensity:", this.specularIntensity);
		console.log("Shininess:", this.shininess);

		gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
		gl.uniform1f(this.shininessLoc, this.shininess);

		//changed for task 3 ------------------------------------------------------------------------------------------

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
    	gl.enableVertexAttribArray(this.normalLoc);
    	gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
		

		//----------------------------------------------------------------------------------------------

		///////////////////////////////


		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);


	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// Non-power-of-2 textures (NPOT)--------------------------------------------------
		
			// Set wrapping modes to CLAMP_TO_EDGE
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
			// Use linear filtering for magnification and minification
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // No mipmaps
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		

		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */

		//-----------------------------------------------------------------------------------------------
		this.lightingEnabled = show;
		gl.useProgram(this.prog);
    	gl.uniform1i(this.enableLightingLoc, this.lightingEnabled);

		//-----------------------------------------------------------------------------------------------

	}
	
	setAmbientLight(ambient) {
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */

		//-----------------------------------------------------------------------------------------------

		this.ambient = ambient;

		//-----------------------------------------------------------------------------------------------
	}

}

function SetSpecularLight(param) {
    meshDrawer.setSpecularLight(param.value / 100.0); // Normalize to [0, 1]
    DrawScene();
}

function SetShininess(param) {
    meshDrawer.setShininess(parseFloat(param.value)); // Direct shininess value
    DrawScene();
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			varying vec3 fragPos;

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				fragPos = pos;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
				precision mediump float;

				uniform bool showTex;
				uniform bool enableLighting;
				uniform sampler2D tex;
				uniform vec3 color; 
				uniform vec3 lightPos;
				uniform vec3 viewPos;  // Camera position uniform
				uniform float ambient;

				uniform float specularIntensity;
				uniform float shininess;

				varying vec2 v_texCoord;
				varying vec3 v_normal;
				varying vec3 fragPos;

				void main() {
					vec4 texColor = texture2D(tex, v_texCoord); // Sample texture color
					vec3 norm = normalize(v_normal);           // Normalize interpolated normal
					vec3 lightDir = normalize(viewPos - fragPos); // Calculate light direction
					vec3 viewDir = normalize(viewPos - fragPos);   // Correctly calculate view direction

					// Ambient light
					vec3 ambientLight = ambient * vec3(1.0, 1.0, 1.0);

					// Diffuse light
					float diff = max(dot(norm, lightDir), 0.0); // Dot product for diffuse lighting
					vec3 diffuseLight = diff * vec3(1.0, 1.0, 1.0);

					// Specular light
					vec3 reflectDir = reflect(-lightDir, norm); 
					float spec = 0.0;
					if (dot(norm, lightDir) > 0.0) {
						spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
					}
					vec3 specularLight = specularIntensity * spec * vec3(1.0, 1.0, 1.0);

					// Final lighting color
					vec3 resultColor = ambientLight + diffuseLight + specularLight;

					if (!enableLighting) {
						// If lighting is disabled, make the object uniformly bright
						if (showTex) {
							gl_FragColor = texColor; // Render only the texture
						} else {
							gl_FragColor = vec4(color, 1.0); // Render base color
						}
					} else {
						// Apply lighting effects
						if (showTex) {
							gl_FragColor = vec4(resultColor, 1.0) * texColor;
						} else {
							gl_FragColor = vec4(resultColor * color, 1.0);
						}
					}

			}`;

			



			


// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;



const keys = {};
function updateLightPos() {
    if (!meshDrawer.viewPos) {
        meshDrawer.viewPos = [0.0, 0.0, -3.0]; // Default fallback
    }

    console.log("Current view position:", meshDrawer.viewPos);

    const translationSpeed = 0.1; // Adjust the speed of the camera's movement
    if (keys['ArrowUp']) meshDrawer.viewPos[1] += translationSpeed; // Move camera up
    if (keys['ArrowDown']) meshDrawer.viewPos[1] -= translationSpeed; // Move camera down
    if (keys['ArrowLeft']) meshDrawer.viewPos[0] -= translationSpeed; // Move camera left
    if (keys['ArrowRight']) meshDrawer.viewPos[0] += translationSpeed; // Move camera right

    // Ensure the data type is valid before sending it to the shader
    gl.useProgram(meshDrawer.prog);
    gl.uniform3fv(meshDrawer.viewPosLoc, new Float32Array(meshDrawer.viewPos));
}

///////////////////////////////////////////////////////////////////////////////////